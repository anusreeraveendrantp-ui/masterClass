import "next-auth";
import type { DefaultSession } from "next-auth";

export type Role = "STUDENT" | "ORGANIZER" | "ADMIN";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: Role;
      trustScore: number;
    };
  }
}
