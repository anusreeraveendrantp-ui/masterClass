import path from "node:path";
import { defineConfig } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  earlyAccess: true,
  schema: path.join("prisma", "schema.prisma"),
  migrate: {
    url: process.env.DATABASE_URL!,
    seed: "npx tsx prisma/seed.ts",
    async adapter() {
      const { PrismaPg } = await import("@prisma/adapter-pg");
      const connectionString = process.env.DATABASE_URL!;
      return new PrismaPg({ connectionString });
    },
  },
});
