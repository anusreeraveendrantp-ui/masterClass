import { streamText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const requestSchema = z.object({
  sessionId: z.string(),
  notes: z.string().min(50, "Notes must be at least 50 characters"),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(parsed.error.errors[0].message, { status: 422 });
  }

  const { sessionId, notes } = parsed.data;

  // Verify user is a participant or host
  const studySession = await db.studySession.findUnique({
    where: { id: sessionId },
    include: { participants: { where: { userId: session.user.id } } },
  });

  if (
    !studySession ||
    (studySession.hostId !== session.user.id &&
      studySession.participants.length === 0)
  ) {
    return new Response("Forbidden", { status: 403 });
  }

  const prompt = `You are an expert academic tutor. Based on the following study notes, create:

1. A concise, well-structured study guide summary (3-5 key points, using bullet points)
2. 7 quiz questions with multiple-choice answers (A, B, C, D) and indicate the correct answer

Format your response with clear sections:
## Study Guide Summary
[bullet points]

## Quiz Questions
[numbered questions with options and answers]

--- STUDENT NOTES ---
${notes}`;

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    prompt,
    maxTokens: 1500,
    temperature: 0.4,
    onFinish: async ({ text }) => {
      // Persist the generated content
      await db.studyGuide.upsert({
        where: { sessionId },
        create: {
          sessionId,
          userId: session.user!.id,
          sourceNotes: notes,
          aiGeneratedContent: text,
        },
        update: {
          sourceNotes: notes,
          aiGeneratedContent: text,
        },
      });
    },
  });

  return result.toDataStreamResponse();
}
