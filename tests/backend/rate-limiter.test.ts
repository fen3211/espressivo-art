import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  RateLimiter,
  MemoryRateLimiterStore,
  FailClosedRateLimiterStore,
  UpstashRedisRateLimiterStore,
  GenericRedisRateLimiterStore,
  extractClientIp,
  sanitizeIp,
  isValidIp,
  createDefaultRateLimiterStore,
  authRateLimiter,
} from "@/lib/rate-limiter";
import { POST as postLogin } from "@/app/api/auth/login/route";

describe("Unified Rate Limiter & Anti-Spoofing Architecture (lib/rate-limiter.ts)", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  // ---------------------------------------------------------------------------
  // 1. IP Sanitization and Validation
  // ---------------------------------------------------------------------------
  describe("1. IP Sanitization & Validation (Anti-Injection & Port Stripping)", () => {
    it("should strip port numbers from IPv4 addresses", () => {
      expect(sanitizeIp("198.51.100.42:54321")).toBe("198.51.100.42");
      expect(sanitizeIp("  203.0.113.195:80  ")).toBe("203.0.113.195");
      expect(sanitizeIp("10.0.0.1")).toBe("10.0.0.1");
    });

    it("should strip brackets and ports from IPv6 addresses", () => {
      expect(sanitizeIp("[2001:db8::1]:8080")).toBe("2001:db8::1");
      expect(sanitizeIp("[2001:db8:85a3::8a2e:370:7334]")).toBe("2001:db8:85a3::8a2e:370:7334");
      expect(sanitizeIp("::1")).toBe("::1");
    });

    it("should correctly validate valid and reject invalid IP strings", () => {
      expect(isValidIp("127.0.0.1")).toBe(true);
      expect(isValidIp("192.168.1.254")).toBe(true);
      expect(isValidIp("2001:db8::1")).toBe(true);
      expect(isValidIp("::1")).toBe(true);

      // Injections and malformed strings
      expect(isValidIp("")).toBe(false);
      expect(isValidIp("unknown")).toBe(false);
      expect(isValidIp("999.999.999.999")).toBe(false);
      expect(isValidIp("1.2.3.4; DROP TABLE users;")).toBe(false);
      expect(isValidIp("<script>alert(1)</script>")).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Client IP Extraction & Anti-Spoofing
  // ---------------------------------------------------------------------------
  describe("2. Client IP Extraction & Anti-Spoofing", () => {
    it("should fall back to 'unknown-client' when no proxy headers are present", () => {
      const req = new Request("http://localhost:3000/api/auth/login");
      const ip = extractClientIp(req);
      expect(ip).toBe("unknown-client");
    });

    it("should extract client IP from single-hop X-Forwarded-For", () => {
      const req = new Request("http://localhost:3000/api/auth/login", {
        headers: { "x-forwarded-for": "198.51.100.42" },
      });
      const ip = extractClientIp(req, { trustedProxyCount: 1 });
      expect(ip).toBe("198.51.100.42");
    });

    it("should neutralize X-Forwarded-For spoofing by taking rightmost trusted proxy hop", () => {
      // Attacker tries to spoof their IP as 1.1.1.1, but reverse proxy appends real client IP 203.0.113.50
      const req = new Request("http://localhost:3000/api/auth/login", {
        headers: {
          "x-forwarded-for": "1.1.1.1, 203.0.113.50",
        },
      });

      // Default trustedProxyCount=1 (1 proxy hop directly before app)
      const extracted = extractClientIp(req, { trustedProxyCount: 1 });
      expect(extracted).toBe("203.0.113.50");
      expect(extracted).not.toBe("1.1.1.1");
    });

    it("should neutralize rotating spoofed IPs across consecutive attacker requests", () => {
      const realAttackerIp = "198.51.100.99";

      // Request 1: Attacker sends spoofed 8.8.8.8
      const req1 = new Request("http://localhost:3000/api/auth/login", {
        headers: { "x-forwarded-for": `8.8.8.8, ${realAttackerIp}` },
      });
      expect(extractClientIp(req1, { trustedProxyCount: 1 })).toBe(realAttackerIp);

      // Request 2: Attacker changes spoofed IP to 9.9.9.9
      const req2 = new Request("http://localhost:3000/api/auth/login", {
        headers: { "x-forwarded-for": `9.9.9.9, ${realAttackerIp}` },
      });
      expect(extractClientIp(req2, { trustedProxyCount: 1 })).toBe(realAttackerIp);

      // Both requests resolve to the identical real IP, preventing rate limit bypass!
    });

    it("should prioritize trusted reverse proxy header (CF-Connecting-IP) over spoofed X-Forwarded-For", () => {
      const req = new Request("http://localhost:3000/api/auth/login", {
        headers: {
          "cf-connecting-ip": "198.51.100.77",
          "x-forwarded-for": "spoofed.attacker.ip, 10.0.0.1",
        },
      });

      const extracted = extractClientIp(req, { trustedHeader: "cf-connecting-ip" });
      expect(extracted).toBe("198.51.100.77");
    });

    it("should support True-Client-IP and X-Real-IP headers", () => {
      const req1 = new Request("http://localhost:3000/api/auth/login", {
        headers: { "true-client-ip": "198.51.100.88" },
      });
      expect(extractClientIp(req1, { trustedHeader: "true-client-ip" })).toBe("198.51.100.88");

      const req2 = new Request("http://localhost:3000/api/auth/login", {
        headers: { "x-real-ip": "198.51.100.89" },
      });
      expect(extractClientIp(req2, { trustedHeader: "x-real-ip" })).toBe("198.51.100.89");
    });

    it("should support trusted proxy IP list traversal", () => {
      // Chain: client_ip -> proxy1 (10.0.0.1) -> proxy2 (10.0.0.2)
      const req = new Request("http://localhost:3000/api/auth/login", {
        headers: {
          "x-forwarded-for": "203.0.113.100, 10.0.0.1, 10.0.0.2",
        },
      });

      const extracted = extractClientIp(req, {
        trustedProxies: ["10.0.0.1", "10.0.0.2"],
      });
      expect(extracted).toBe("203.0.113.100");
    });
  });

  // ---------------------------------------------------------------------------
  // 3. RateLimiter Functional Operation (MemoryStore)
  // ---------------------------------------------------------------------------
  describe("3. RateLimiter Core Behavior (Multiple Requests & Threshold)", () => {
    let limiter: RateLimiter;
    let store: MemoryRateLimiterStore;

    beforeEach(() => {
      store = new MemoryRateLimiterStore();
      limiter = new RateLimiter({
        store,
        maxAttempts: 3,
        windowMs: 5000,
        blockDurationMs: 10000,
      });
    });

    it("should allow attempts below threshold and accurately track remaining attempts", async () => {
      const key = "user-1";

      const checkInitial = await limiter.check(key);
      expect(checkInitial.isBlocked).toBe(false);
      expect(checkInitial.remaining).toBe(3);

      // Attempt 1
      const res1 = await limiter.recordFailedAttempt(key);
      expect(res1.isBlocked).toBe(false);
      expect(res1.remaining).toBe(2);

      // Attempt 2
      const res2 = await limiter.recordFailedAttempt(key);
      expect(res2.isBlocked).toBe(false);
      expect(res2.remaining).toBe(1);

      // Attempt 3 (threshold reached: 3 of 3)
      const res3 = await limiter.recordFailedAttempt(key);
      expect(res3.isBlocked).toBe(true);
      expect(res3.remaining).toBe(0);
      expect(res3.retryAfterSeconds).toBeGreaterThan(0);

      // Subsequent check confirms blocking
      const checkBlocked = await limiter.check(key);
      expect(checkBlocked.isBlocked).toBe(true);
      expect(checkBlocked.retryAfterSeconds).toBeGreaterThan(0);
    });

    it("should isolate rate limits across different client keys / IPs", async () => {
      const keyA = "ip-10-0-0-1:admin@espressivo.art";
      const keyB = "ip-10-0-0-2:admin@espressivo.art";

      // Exhaust keyA
      await limiter.recordFailedAttempt(keyA);
      await limiter.recordFailedAttempt(keyA);
      await limiter.recordFailedAttempt(keyA);

      const checkA = await limiter.check(keyA);
      expect(checkA.isBlocked).toBe(true);

      // keyB must remain unblocked with full remaining attempts
      const checkB = await limiter.check(keyB);
      expect(checkB.isBlocked).toBe(false);
      expect(checkB.remaining).toBe(3);
    });

    it("should clear rate limit on successful authentication", async () => {
      const key = "victim@espressivo.art";

      // 2 failed attempts
      await limiter.recordFailedAttempt(key);
      await limiter.recordFailedAttempt(key);

      const checkBefore = await limiter.check(key);
      expect(checkBefore.remaining).toBe(1);

      // Clear (successful login)
      await limiter.clear(key);

      const checkAfter = await limiter.check(key);
      expect(checkAfter.isBlocked).toBe(false);
      expect(checkAfter.remaining).toBe(3);
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Production Fail-Closed Security Policy
  // ---------------------------------------------------------------------------
  describe("4. Production Fail-Closed Security Policy", () => {
    it("should create FailClosedRateLimiterStore when in NODE_ENV=production without distributed storage", () => {
      (process.env as Record<string, string | undefined>).NODE_ENV = "production";
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
      delete process.env.REDIS_URL;
      delete process.env.ALLOW_INSECURE_IN_MEMORY_RATE_LIMITER;

      const store = createDefaultRateLimiterStore();
      expect(store.name).toBe("fail-closed");
      expect(store).toBeInstanceOf(FailClosedRateLimiterStore);
    });

    it("FailClosedRateLimiterStore should immediately block and report failClosed=true", async () => {
      const failClosedStore = new FailClosedRateLimiterStore();
      const limiter = new RateLimiter({ store: failClosedStore });

      const check = await limiter.check("any-key");
      expect(check.isBlocked).toBe(true);
      expect(check.failClosed).toBe(true);
      expect(check.error).toBe("RATE_LIMIT_STORE_MISSING");
      expect(check.retryAfterSeconds).toBe(60);

      const inc = await limiter.recordFailedAttempt("any-key");
      expect(inc.isBlocked).toBe(true);
      expect(inc.failClosed).toBe(true);
    });

    it("POST /api/auth/login should return 503 SERVICE_UNAVAILABLE when fail-closed is active in production", async () => {
      (process.env as Record<string, string | undefined>).NODE_ENV = "production";
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
      delete process.env.REDIS_URL;
      delete process.env.ALLOW_INSECURE_IN_MEMORY_RATE_LIMITER;

      authRateLimiter.refreshStore();

      try {
        const req = new Request("http://localhost:3000/api/auth/login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            email: "teacher@espressivo.art",
            password: "password123",
          }),
        });

        const res = await postLogin(req);
        expect(res.status).toBe(503);
        const data = await res.json();
        expect(data.code).toBe("SERVICE_UNAVAILABLE");
      } finally {
        (process.env as Record<string, string | undefined>).NODE_ENV = "test";
        authRateLimiter.refreshStore();
      }
    });

    it("should allow in-memory store in production ONLY when ALLOW_INSECURE_IN_MEMORY_RATE_LIMITER=true is set", () => {
      (process.env as Record<string, string | undefined>).NODE_ENV = "production";
      process.env.ALLOW_INSECURE_IN_MEMORY_RATE_LIMITER = "true";

      const store = createDefaultRateLimiterStore();
      expect(store.name).toBe("memory");
      expect(store).toBeInstanceOf(MemoryRateLimiterStore);
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Distributed Storage (Upstash / Redis) Integration
  // ---------------------------------------------------------------------------
  describe("5. Distributed Storage Pluggability (Upstash REST & Generic Redis)", () => {
    it("UpstashRedisRateLimiterStore should correctly interact with Upstash REST endpoints", async () => {
      const mockFetch = vi.fn();
      global.fetch = mockFetch;

      const upstashStore = new UpstashRedisRateLimiterStore("https://example.upstash.io", "test-token");

      // Mock PTTL (not blocked: returns -2)
      // Mock pipeline: INCR -> 1, PTTL -> 60000
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ result: -2 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [{ result: 1 }, { result: 60000 }],
        });

      const res = await upstashStore.increment("test-key", 60000, 5, 900000);
      expect(res.isBlocked).toBe(false);
      expect(res.remaining).toBe(4);
      expect(res.storeName).toBe("upstash-redis");

      // Verify Authorization header
      expect(mockFetch).toHaveBeenCalledWith(
        "https://example.upstash.io",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        })
      );
    });

    it("GenericRedisRateLimiterStore should interact properly with standard Redis clients", async () => {
      let count = 0;
      const mockRedisClient = {
        get: vi.fn().mockResolvedValue(null),
        set: vi.fn().mockResolvedValue("OK"),
        del: vi.fn().mockResolvedValue(1),
        incr: vi.fn().mockImplementation(async () => ++count),
        pttl: vi.fn().mockResolvedValue(-2),
        pexpire: vi.fn().mockResolvedValue(1),
      };

      const redisStore = new GenericRedisRateLimiterStore(mockRedisClient);
      const limiter = new RateLimiter({ store: redisStore, maxAttempts: 2 });

      // Attempt 1
      const res1 = await limiter.recordFailedAttempt("user-x");
      expect(res1.isBlocked).toBe(false);
      expect(res1.remaining).toBe(1);

      // Attempt 2 (reaches threshold)
      const res2 = await limiter.recordFailedAttempt("user-x");
      expect(res2.isBlocked).toBe(true);
      expect(mockRedisClient.set).toHaveBeenCalledWith("user-x:blocked", "1", { px: 900000 });
    });
  });
});
