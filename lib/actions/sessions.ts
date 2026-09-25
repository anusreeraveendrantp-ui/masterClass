"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createSessionSchema, type CreateSessionInput } from "@/lib/validators/session";
import { pusherServer, CHANNELS, EVENTS } from "@/lib/pusher";
import { recalculateTrustScore } from "@/lib/trust-score";
import type { ActionResult } from "@/lib/actions/auth";

/** Create a new study session with conflict detection */
export async function createSession(
  input: CreateSessionInput
): Promise<ActionResult & { sessionId?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const parsed = createSessionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { courseId, title, description, startTime, endTime, location, maxCapacity } =
    parsed.data;

  const start = new Date(startTime);
  const end = new Date(endTime);

  // Conflict detection — check host's existing sessions
  const conflict = await db.studySession.findFirst({
    where: {
      hostId: session.user.id,
      status: { in: ["UPCOMING", "ACTIVE"] },
      AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }],
    },
  });

  if (conflict) {
    return {
      success: false,
      error: `You already have a session "${conflict.title}" overlapping this time slot.`,
    };
  }

  const newSession = await db.studySession.create({
    data: {
      courseId,
      hostId: session.user.id,
      title,
      description,
      startTime: start,
      endTime: end,
      location,
      maxCapacity,
    },
  });

  // Also add host as a participant
  await db.participant.create({
    data: { sessionId: newSession.id, userId: session.user.id, status: "JOINED" },
  });

  await pusherServer.trigger(CHANNELS.dashboard, EVENTS.SESSION_UPDATED, {
    sessionId: newSession.id,
    action: "created",
  });

  revalidateTag("sessions");
  revalidatePath("/dashboard/sessions");

  return { success: true, message: "Session created.", sessionId: newSession.id };
}

/** Join an existing session */
export async function joinSession(sessionId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const studySession = await db.studySession.findUnique({
    where: { id: sessionId },
    include: { _count: { select: { participants: true } } },
  });

  if (!studySession) return { success: false, error: "Session not found." };
  if (studySession.status === "CANCELLED")
    return { success: false, error: "This session has been cancelled." };
  if (studySession._count.participants >= studySession.maxCapacity)
    return { success: false, error: "This session is full." };

  // Conflict detection for participant
  const conflict = await db.studySession.findFirst({
    where: {
      participants: { some: { userId: session.user.id } },
      status: { in: ["UPCOMING", "ACTIVE"] },
      AND: [
        { startTime: { lt: studySession.endTime } },
        { endTime: { gt: studySession.startTime } },
      ],
    },
  });

  if (conflict) {
    return {
      success: false,
      error: `You have a conflicting session "${conflict.title}" at that time.`,
    };
  }

  await db.participant.upsert({
    where: { sessionId_userId: { sessionId, userId: session.user.id } },
    create: { sessionId, userId: session.user.id, status: "JOINED" },
    update: { status: "JOINED" },
  });

  await pusherServer.trigger(
    CHANNELS.session(sessionId),
    EVENTS.PARTICIPANT_JOINED,
    { userId: session.user.id }
  );

  revalidateTag("sessions");
  revalidatePath(`/dashboard/sessions/${sessionId}`);

  return { success: true, message: "You have joined the session." };
}

/** Mark session as completed and update trust scores */
export async function completeSession(sessionId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const studySession = await db.studySession.findUnique({
    where: { id: sessionId },
    include: {
      participants: { include: { user: true } },
      ratings: true,
    },
  });

  if (!studySession) return { success: false, error: "Session not found." };
  if (studySession.hostId !== session.user.id)
    return { success: false, error: "Only the host can complete this session." };

  await db.studySession.update({
    where: { id: sessionId },
    data: { status: "COMPLETED" },
  });

  // Recalculate trust scores for each participant
  for (const participant of studySession.participants) {
    const attended = participant.status === "ATTENDED";
    const ratingsReceived = studySession.ratings
      .filter((r) => r.rateeId === participant.userId)
      .map((r) => r.score);

    const lastSession = await db.studySession.findFirst({
      where: {
        participants: { some: { userId: participant.userId } },
        status: "COMPLETED",
        id: { not: sessionId },
      },
      orderBy: { endTime: "desc" },
    });

    const newTrust = recalculateTrustScore(
      participant.user.trustScore,
      attended,
      ratingsReceived,
      lastSession?.endTime ?? null
    );

    await db.user.update({
      where: { id: participant.userId },
      data: { trustScore: newTrust },
    });
  }

  revalidateTag("sessions");
  revalidatePath(`/dashboard/sessions/${sessionId}`);

  return { success: true, message: "Session marked as completed." };
}

/** Cancel a session (host only) */
export async function cancelSession(sessionId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const studySession = await db.studySession.findUnique({
    where: { id: sessionId },
  });

  if (!studySession) return { success: false, error: "Session not found." };
  if (studySession.hostId !== session.user.id)
    return { success: false, error: "Only the host can cancel this session." };

  await db.studySession.update({
    where: { id: sessionId },
    data: { status: "CANCELLED" },
  });

  revalidateTag("sessions");
  revalidatePath("/dashboard/sessions");

  return { success: true, message: "Session cancelled." };
}

/** Submit a rating for a session participant */
export async function rateParticipant(
  sessionId: string,
  rateeId: string,
  score: number,
  comment?: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  if (score < 1 || score > 5)
    return { success: false, error: "Score must be between 1 and 5." };

  await db.rating.upsert({
    where: {
      sessionId_raterId_rateeId: {
        sessionId,
        raterId: session.user.id,
        rateeId,
      },
    },
    create: { sessionId, raterId: session.user.id, rateeId, score, comment },
    update: { score, comment },
  });

  await db.participant.updateMany({
    where: { sessionId, userId: session.user.id },
    data: { ratingGiven: true },
  });

  revalidatePath(`/dashboard/sessions/${sessionId}`);

  return { success: true, message: "Rating submitted." };
}
