import PusherServer from "pusher";
import PusherClient from "pusher-js";

// Server-side Pusher instance (used in API routes / Server Actions)
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

// Client-side Pusher instance (singleton)
let pusherClientInstance: PusherClient | null = null;

export function getPusherClient(): PusherClient {
  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_KEY!,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      }
    );
  }
  return pusherClientInstance;
}

// Channel naming helpers
export const CHANNELS = {
  session: (id: string) => `session-${id}`,
  userAvailability: (id: string) => `user-${id}-availability`,
  dashboard: "dashboard",
} as const;

export const EVENTS = {
  SESSION_UPDATED: "session:updated",
  PARTICIPANT_JOINED: "participant:joined",
  PARTICIPANT_LEFT: "participant:left",
  AVAILABILITY_UPDATED: "availability:updated",
} as const;
