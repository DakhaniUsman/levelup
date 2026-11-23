import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { UserRole } from "@/models/User";

const secretKey =
  process.env.SESSION_SECRET ||
  "levelup_fallback_secret_key_at_least_32_chars_long_safety";
const encodedKey = new TextEncoder().encode(secretKey);

export interface SessionPayload {
  userId: string;
  role: UserRole;
  username: string;
  expiresAt: Date;
}

export async function encryptSession(
  payload: SessionPayload,
  rememberMe: boolean = false
): Promise<string> {
  const expiry = rememberMe ? "30d" : "1d";
  return new SignJWT({
    userId: payload.userId,
    role: payload.role,
    username: payload.username,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiry)
    .sign(encodedKey);
}

export async function decryptSession(
  sessionToken: string | undefined = ""
): Promise<SessionPayload | null> {
  if (!sessionToken) return null;

  try {
    const { payload } = await jwtVerify(sessionToken, encodedKey, {
      algorithms: ["HS256"],
    });

    return {
      userId: payload.userId as string,
      role: payload.role as UserRole,
      username: payload.username as string,
      expiresAt: new Date((payload.exp as number) * 1000),
    };
  } catch {
    return null;
  }
}

export async function createSession(
  userId: string,
  role: UserRole,
  username: string,
  rememberMe: boolean = false
) {
  const durationMs = rememberMe
    ? 30 * 24 * 60 * 60 * 1000
    : 24 * 60 * 60 * 1000;
  const expiresAt = new Date(Date.now() + durationMs);
  const token = await encryptSession(
    {
      userId,
      role,
      username,
      expiresAt,
    },
    rememberMe
  );

  const cookieStore = await cookies();
  cookieStore.set("level_up_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    maxAge: Math.floor(durationMs / 1000),
    sameSite: "lax",
    path: "/",
  });

  return token;
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("level_up_session")?.value;
  return decryptSession(sessionToken);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("level_up_session");
}

