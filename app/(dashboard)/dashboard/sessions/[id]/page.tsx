import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { SessionDetail } from "@/components/features/sessions/session-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SessionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user!.id;

  const studySession = await db.studySession.findUnique({
    where: { id },
    include: {
      course: true,
      host: { select: { id: true, name: true, image: true, trustScore: true } },
      participants: {
        include: {
          user: { select: { id: true, name: true, image: true, trustScore: true } },
        },
      },
      ratings: {
        where: { raterId: userId },
      },
      studyGuide: true,
    },
  });

  if (!studySession) notFound();

  const isHost = studySession.hostId === userId;
  const isParticipant = studySession.participants.some((p) => p.userId === userId);

  return (
    <SessionDetail
      session={studySession}
      currentUserId={userId}
      isHost={isHost}
      isParticipant={isParticipant}
    />
  );
}
