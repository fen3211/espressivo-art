import { describe, it, expect } from "vitest";
import {
  validateJwtSecret,
  hashPassword,
  verifyPassword,
  createSessionToken,
  verifySessionToken,
  getSession,
  requireRole,
  AuthError,
  AUTH_COOKIE_NAME,
} from "@/lib/auth";

describe("Backend Auth Module (lib/auth.ts)", () => {
  it("should hash a password and verify it correctly", async () => {
    const raw = "SecureP@ss2026!";
    const hash = await hashPassword(raw);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(raw);

    const isMatch = await verifyPassword(raw, hash);
    expect(isMatch).toBe(true);

    const wrongMatch = await verifyPassword("WrongPassword123", hash);
    expect(wrongMatch).toBe(false);
  });

  it("should create and verify valid JWT session token", async () => {
    const payload = {
      userId: "user_test_123",
      email: "test@espressivo.art",
      role: "TEACHER",
      fullName: "Анна Петрова",
    };

    const token = await createSessionToken(payload);
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(20);

    const decoded = await verifySessionToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.email).toBe(payload.email);
    expect(decoded?.role).toBe(payload.role);
    expect(decoded?.fullName).toBe(payload.fullName);
  });

  it("should return null for tampered or invalid token", async () => {
    const validToken = await createSessionToken({
      userId: "user_test",
      email: "test@espressivo.art",
      role: "PARTICIPANT",
      fullName: "Test",
    });

    const tampered = validToken.substring(0, validToken.length - 5) + "abcde";
    const result = await verifySessionToken(tampered);
    expect(result).toBeNull();

    const emptyResult = await verifySessionToken("totally-invalid-garbage-token");
    expect(emptyResult).toBeNull();
  });

  it("should extract session from Cookie header in Request", async () => {
    const token = await createSessionToken({
      userId: "u1",
      email: "participant@espressivo.art",
      role: "PARTICIPANT",
      fullName: "Participant User",
    });

    const req = new Request("http://localhost:3000/api/applications", {
      headers: {
        cookie: `someOtherCookie=123; ${AUTH_COOKIE_NAME}=${token}; yetAnother=456`,
      },
    });

    const session = await getSession(req);
    expect(session).not.toBeNull();
    expect(session?.userId).toBe("u1");
    expect(session?.role).toBe("PARTICIPANT");
  });

  it("should extract session from Authorization Bearer header", async () => {
    const token = await createSessionToken({
      userId: "admin_1",
      email: "admin@espressivo.art",
      role: "ADMIN",
      fullName: "Admin Lead",
    });

    const req = new Request("http://localhost:3000/api/admin/overview", {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    const session = await getSession(req);
    expect(session?.userId).toBe("admin_1");
    expect(session?.role).toBe("ADMIN");
  });

  it("should enforce requireRole correctly and throw AuthError", async () => {
    const token = await createSessionToken({
      userId: "teacher_1",
      email: "teacher@espressivo.art",
      role: "TEACHER",
      fullName: "Teacher",
    });

    const req = new Request("http://localhost:3000/api/teacher/dashboard", {
      headers: { authorization: `Bearer ${token}` },
    });

    // Allowed role
    const session = await requireRole(req, ["TEACHER", "ADMIN"]);
    expect(session.userId).toBe("teacher_1");

    // Forbidden role
    await expect(requireRole(req, ["ADMIN", "JURY"])).rejects.toThrow(AuthError);

    // Unauthenticated
    const emptyReq = new Request("http://localhost:3000/api/teacher/dashboard");
    await expect(requireRole(emptyReq, ["TEACHER"])).rejects.toThrow(AuthError);
  });

  it("should enforce strict JWT_SECRET presence and >= 32 characters length", () => {
    const originalSecret = process.env.JWT_SECRET;
    try {
      // 1. Missing secret
      delete process.env.JWT_SECRET;
      expect(() => validateJwtSecret()).toThrow("JWT_SECRET environment variable is missing");

      // 2. Short secret (< 32 chars)
      process.env.JWT_SECRET = "too-short-secret";
      expect(() => validateJwtSecret()).toThrow("minimum length is 32 characters");

      // 3. Valid secret (>= 32 chars)
      process.env.JWT_SECRET = "a".repeat(32);
      expect(validateJwtSecret()).toBe("a".repeat(32));
    } finally {
      process.env.JWT_SECRET = originalSecret;
    }
  });
});
