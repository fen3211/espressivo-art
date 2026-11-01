import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export interface SessionPayload {
  userId: string;
  email: string;
  role: string; // "PARTICIPANT" | "TEACHER" | "JURY" | "ADMIN"
  fullName: string;
}

export const AUTH_COOKIE_NAME = "token";

/**
 * Validates the JWT_SECRET environment variable.
 * Must be present and at least 32 characters long.
 * Throws an error immediately in production if missing or weak.
 */
export function validateJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is missing");
  }
  if (secret.length < 32) {
    throw new Error(`JWT_SECRET is insecure: minimum length is 32 characters, got ${secret.length}`);
  }
  return secret;
}

// In production, validate immediately at startup/module load to fail fast
if (process.env.NODE_ENV === "production") {
  validateJwtSecret();
}

function getSecretKey(): Uint8Array {
  const secret = validateJwtSecret();
  return new TextEncoder().encode(secret);
}

/**
 * Hash a plain text password with bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

/**
 * Verify a plain text password against a bcrypt hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Create a signed JWT session token with jose.
 */
export async function createSessionToken(
  payload: SessionPayload,
  expiresIn: string = "7d"
): Promise<string> {
  return await new SignJWT({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    fullName: payload.fullName,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecretKey());
}

/**
 * Verify and decode a JWT session token.
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (!payload.userId || !payload.email || !payload.role || !payload.fullName) {
      return null;
    }
    return {
      userId: String(payload.userId),
      email: String(payload.email),
      role: String(payload.role),
      fullName: String(payload.fullName),
    };
  } catch {
    return null;
  }
}

/**
 * Parse cookie by name from cookie header string.
 */
function parseCookieHeader(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Retrieve session from Request (Cookie or Authorization Bearer) or next/headers cookies.
 */
export async function getSession(req?: Request): Promise<SessionPayload | null> {
  let token: string | null = null;

  if (req) {
    // 1. Check Cookie header
    const cookieHeader = req.headers.get("cookie");
    token = parseCookieHeader(cookieHeader, AUTH_COOKIE_NAME);

    // 2. Check Authorization: Bearer <token>
    if (!token) {
      const authHeader = req.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7).trim();
      }
    }
  }

  // 3. Check next/headers cookies if available
  if (!token) {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const cookieObj = cookieStore.get(AUTH_COOKIE_NAME);
      if (cookieObj?.value) {
        token = cookieObj.value;
      }
    } catch {
      // Outside of Next.js server context (e.g. unit tests)
    }
  }

  if (!token) {
    return null;
  }

  return await verifySessionToken(token);
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number = 401) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

/**
 * Enforce role requirement. Throws AuthError(401) if not authenticated,
 * or AuthError(403) if role not allowed.
 */
export async function requireRole(
  req: Request | undefined,
  allowedRoles: string[]
): Promise<SessionPayload> {
  const session = await getSession(req);
  if (!session) {
    throw new AuthError("Authentication required", 401);
  }
  if (!allowedRoles.includes(session.role)) {
    throw new AuthError("Access forbidden: insufficient role permissions", 403);
  }
  return session;
}

/**
 * Attach HttpOnly session cookie to an outgoing NextResponse.
 */
export function setAuthCookie(response: NextResponse, token: string, maxAgeSeconds: number = 7 * 24 * 60 * 60): NextResponse {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });
  return response;
}

/**
 * Remove session cookie from an outgoing NextResponse.
 */
export function clearAuthCookie(response: NextResponse): NextResponse {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
