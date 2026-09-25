"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema, type RegisterInput } from "@/lib/validators/auth";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function registerUser(
  input: RegisterInput
): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { name, email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.user.create({
    data: { name, email, passwordHash },
  });

  return { success: true, message: "Account created. You can now sign in." };
}

export async function loginUser(formData: FormData): Promise<ActionResult> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
    return { success: true, message: "Logged in successfully." };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Invalid email or password." };
        default:
          return { success: false, error: "Something went wrong. Please try again." };
      }
    }
    throw error;
  }
}
