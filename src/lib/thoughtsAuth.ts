import { createHash } from "crypto";
import { cookies } from "next/headers";

export const THOUGHTS_COOKIE = "thoughts_unlocked";
export const THOUGHTS_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function tokenForPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export function expectedToken(): string | null {
  const pw = process.env.THOUGHTS_PASSWORD;
  if (!pw) return null;
  return tokenForPassword(pw);
}

export async function isThoughtsUnlocked(): Promise<boolean> {
  // Always read cookies so callers (Server Components) opt into dynamic
  // rendering — otherwise Next.js can statically prerender the home page and
  // serve cached HTML after the password env var is added.
  const store = await cookies();
  const expected = expectedToken();
  if (!expected) return true; // No password configured → not gated.
  const got = store.get(THOUGHTS_COOKIE)?.value;
  return !!got && got === expected;
}
