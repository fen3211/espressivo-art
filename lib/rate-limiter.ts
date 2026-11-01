/**
 * Unified Rate Limiting Architecture for espressivo ART
 * 
 * Features:
 * - Pluggable storage: MemoryRateLimiterStore (dev/test), UpstashRedisRateLimiterStore (production),
 *   GenericRedisRateLimiterStore, and FailClosedRateLimiterStore.
 * - Production Fail-Closed Policy: In production (NODE_ENV=production), if no distributed
 *   store is configured, all checks fail closed with 503 Service Unavailable / Rate Limit Exceeded
 *   rather than allowing uncoordinated in-memory storage across stateless instances.
 *   (Can be explicitly overridden with ALLOW_INSECURE_IN_MEMORY_RATE_LIMITER="true" for staging).
 * - Anti-Spoofing Client IP Extraction: Protects against X-Forwarded-For header spoofing by
 *   validating trusted proxy hops (rightmost trusted hop selection) or verified reverse proxy
 *   headers (CF-Connecting-IP, True-Client-IP, X-Real-IP).
 */

export interface RateLimitRecord {
  attempts: number;
  blockedUntil: number; // Unix timestamp in ms, or 0 if not blocked
  resetAt: number;      // Unix timestamp when the attempt window resets
}

export interface RateLimitCheckResult {
  isBlocked: boolean;
  remaining: number;
  retryAfterSeconds?: number;
  failClosed?: boolean;
  error?: string;
  storeName: string;
}

export interface RateLimiterStore {
  readonly name: string;
  get(key: string): Promise<RateLimitRecord | null>;
  check(key: string, maxAttempts: number): Promise<RateLimitCheckResult>;
  increment(
    key: string,
    windowMs: number,
    maxAttempts: number,
    blockDurationMs: number
  ): Promise<RateLimitCheckResult>;
  reset(key: string): Promise<void>;
  clearAll?(): Promise<void>;
}

export interface ClientIpExtractionOptions {
  trustedProxyCount?: number;
  trustedHeader?: string;
  trustedProxies?: string[];
}

export interface RateLimiterOptions {
  windowMs?: number;        // Rate limit sliding/fixed window in ms (default: 10 mins)
  maxAttempts?: number;     // Maximum failed attempts allowed within window (default: 5)
  blockDurationMs?: number; // Duration to block once limit exceeded (default: 15 mins)
  store?: RateLimiterStore; // Pluggable storage instance
  keyPrefix?: string;       // Prefix for keys in storage (default: "rl:auth:")
  proxyConfig?: ClientIpExtractionOptions;
}

// ---------------------------------------------------------------------------
// 1. Anti-Spoofing Client IP Extraction
// ---------------------------------------------------------------------------

const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const IPV6_REGEX = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::$|^::1$|^([0-9a-fA-F]{1,4}:){1,7}:$|^:((:[0-9a-fA-F]{1,4}){1,7}|:)$|^[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})$/;

/**
 * Strips port numbers from IPv4 (e.g. "1.2.3.4:5678" -> "1.2.3.4")
 * or bracketed IPv6 (e.g. "[2001:db8::1]:8080" -> "2001:db8::1").
 */
export function sanitizeIp(raw: string): string {
  const trimmed = raw.trim();
  // Bracketed IPv6 with optional port: [2001:db8::1]:8080 or [2001:db8::1]
  if (trimmed.startsWith("[")) {
    const closeBracket = trimmed.indexOf("]");
    if (closeBracket !== -1) {
      return trimmed.substring(1, closeBracket).trim();
    }
  }
  // IPv4 with port: 198.51.100.42:54321 (contains exactly one colon)
  const colonCount = (trimmed.match(/:/g) || []).length;
  if (colonCount === 1) {
    return trimmed.split(":")[0].trim();
  }
  return trimmed;
}

/**
 * Validates whether an IP string is a syntactically valid IPv4 or IPv6 address.
 */
export function isValidIp(ip: string): boolean {
  if (!ip || ip.length > 45) return false;
  if (IPV4_REGEX.test(ip)) return true;
  if (ip.includes(":") && (IPV6_REGEX.test(ip) || ip === "::1" || ip === "::")) return true;
  // Broad IPv6 fallback check for abbreviated formats
  if (ip.includes(":") && /^[0-9a-fA-F:]+$/.test(ip)) return true;
  return false;
}

/**
 * Securely extracts the true client IP from an incoming Request.
 * Prevents client-side X-Forwarded-For header spoofing:
 * 1. Checks trusted proxy header (e.g. CF-Connecting-IP, True-Client-IP, X-Real-IP) if configured.
 * 2. If using X-Forwarded-For, extracts the rightmost trusted hop according to trustedProxyCount.
 *    (Clients can inject arbitrary values on the left, but reverse proxies append the real IP on the right).
 * 3. Validates IP syntax and sanitizes port numbers.
 */
export function extractClientIp(req: Request, options?: ClientIpExtractionOptions): string {
  const trustedHeaderName = (
    options?.trustedHeader ||
    process.env.TRUSTED_PROXY_HEADER ||
    ""
  ).toLowerCase().trim();

  // 1. Direct trusted single-header (Cloudflare CF-Connecting-IP, Akamai True-Client-IP, Nginx X-Real-IP)
  if (trustedHeaderName) {
    const trustedVal = req.headers.get(trustedHeaderName);
    if (trustedVal) {
      const clean = sanitizeIp(trustedVal);
      if (isValidIp(clean)) {
        return clean;
      }
    }
  }

  // 2. X-Forwarded-For chain extraction
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const rawHops = forwarded
      .split(",")
      .map((s) => sanitizeIp(s))
      .filter((s) => s.length > 0);

    if (rawHops.length > 0) {
      const trustedProxies = options?.trustedProxies || (
        process.env.TRUSTED_PROXIES
          ? process.env.TRUSTED_PROXIES.split(",").map((s) => sanitizeIp(s))
          : []
      );

      // If trusted proxy IP list is provided, walk right-to-left skipping trusted proxies
      if (trustedProxies.length > 0) {
        for (let i = rawHops.length - 1; i >= 0; i--) {
          const hop = rawHops[i];
          if (!trustedProxies.includes(hop) && isValidIp(hop)) {
            return hop;
          }
        }
      }

      // Default: Count-based rightmost trusted hop selection
      // If there are N trusted reverse proxies in front of the app:
      // index = rawHops.length - trustedProxyCount
      const trustedCount = options?.trustedProxyCount ?? (
        process.env.TRUSTED_PROXY_COUNT
          ? Math.max(1, parseInt(process.env.TRUSTED_PROXY_COUNT, 10))
          : 1
      );

      const targetIndex = Math.max(0, rawHops.length - trustedCount);
      const chosenHop = rawHops[targetIndex];
      if (isValidIp(chosenHop)) {
        return chosenHop;
      }

      // If target index isn't valid IP, inspect from rightmost valid
      for (let i = rawHops.length - 1; i >= 0; i--) {
        if (isValidIp(rawHops[i])) {
          return rawHops[i];
        }
      }
    }
  }

  // 3. Fallback to standard X-Real-IP if present
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    const clean = sanitizeIp(realIp);
    if (isValidIp(clean)) {
      return clean;
    }
  }

  return "unknown-client";
}

// ---------------------------------------------------------------------------
// 2. Storage Implementations
// ---------------------------------------------------------------------------

/**
 * In-memory storage for development and local testing.
 * Implements sliding window tracking and automated memory eviction.
 */
export class MemoryRateLimiterStore implements RateLimiterStore {
  readonly name = "memory";
  private records = new Map<string, RateLimitRecord>();
  private readonly maxEntries: number;

  constructor(maxEntries: number = 10000) {
    this.maxEntries = maxEntries;
  }

  private pruneExpired(now: number): void {
    if (this.records.size < this.maxEntries) return;
    for (const [key, record] of this.records.entries()) {
      if (record.blockedUntil <= now && record.resetAt <= now) {
        this.records.delete(key);
      }
    }
  }

  async get(key: string): Promise<RateLimitRecord | null> {
    const now = Date.now();
    const entry = this.records.get(key);
    if (!entry) return null;

    if (entry.blockedUntil <= now && entry.resetAt <= now) {
      this.records.delete(key);
      return null;
    }
    return { ...entry };
  }

  async check(key: string, maxAttempts: number): Promise<RateLimitCheckResult> {
    const now = Date.now();
    const entry = this.records.get(key);
    if (!entry) {
      return {
        isBlocked: false,
        remaining: maxAttempts,
        storeName: this.name,
      };
    }

    if (entry.blockedUntil > now) {
      const retryAfterSeconds = Math.ceil((entry.blockedUntil - now) / 1000);
      return {
        isBlocked: true,
        remaining: 0,
        retryAfterSeconds,
        storeName: this.name,
      };
    }

    if (entry.resetAt <= now && entry.blockedUntil <= now) {
      this.records.delete(key);
      return {
        isBlocked: false,
        remaining: maxAttempts,
        storeName: this.name,
      };
    }

    return {
      isBlocked: false,
      remaining: Math.max(0, maxAttempts - entry.attempts),
      storeName: this.name,
    };
  }

  async increment(
    key: string,
    windowMs: number,
    maxAttempts: number,
    blockDurationMs: number
  ): Promise<RateLimitCheckResult> {
    const now = Date.now();
    this.pruneExpired(now);

    let entry = this.records.get(key);

    // If previously blocked and block is still active
    if (entry && entry.blockedUntil > now) {
      const retryAfterSeconds = Math.ceil((entry.blockedUntil - now) / 1000);
      return {
        isBlocked: true,
        remaining: 0,
        retryAfterSeconds,
        storeName: this.name,
      };
    }

    // If window expired and not currently blocked, start new window
    if (!entry || (entry.resetAt <= now && entry.blockedUntil <= now)) {
      entry = {
        attempts: 1,
        blockedUntil: 0,
        resetAt: now + windowMs,
      };
    } else {
      entry.attempts += 1;
    }

    // Check if limit exceeded
    if (entry.attempts >= maxAttempts) {
      entry.blockedUntil = now + blockDurationMs;
      this.records.set(key, entry);
      const retryAfterSeconds = Math.ceil(blockDurationMs / 1000);
      return {
        isBlocked: true,
        remaining: 0,
        retryAfterSeconds,
        storeName: this.name,
      };
    }

    this.records.set(key, entry);
    return {
      isBlocked: false,
      remaining: Math.max(0, maxAttempts - entry.attempts),
      storeName: this.name,
    };
  }

  async reset(key: string): Promise<void> {
    this.records.delete(key);
  }

  async clearAll(): Promise<void> {
    this.records.clear();
  }
}

/**
 * Fail-Closed store enforced in production when no distributed storage is configured.
 * Prevents uncoordinated in-memory rate limiting across stateless multi-instance deployments.
 */
export class FailClosedRateLimiterStore implements RateLimiterStore {
  readonly name = "fail-closed";

  async get(_key: string): Promise<RateLimitRecord | null> {
    return null;
  }

  async check(_key: string, _maxAttempts: number): Promise<RateLimitCheckResult> {
    return await this.increment(_key, 0, 0, 0);
  }

  async increment(
    _key: string,
    _windowMs: number,
    _maxAttempts: number,
    _blockDurationMs: number
  ): Promise<RateLimitCheckResult> {
    const msg =
      "CRITICAL: Rate limiter distributed storage (Redis/Upstash) is not configured in production. " +
      "Fail-closed policy enforced to prevent distributed brute-force attacks across stateless instances. " +
      "Configure UPSTASH_REDIS_REST_URL/TOKEN or REDIS_URL, or set ALLOW_INSECURE_IN_MEMORY_RATE_LIMITER=true for staging.";
    
    // Log to console for observability
    console.error(`[RateLimiter:${this.name}] ${msg}`);

    return {
      isBlocked: true,
      remaining: 0,
      retryAfterSeconds: 60,
      failClosed: true,
      error: "RATE_LIMIT_STORE_MISSING",
      storeName: this.name,
    };
  }

  async reset(_key: string): Promise<void> {
    // No-op in fail-closed
  }
}

/**
 * Upstash Redis REST API distributed rate limiter store.
 * Uses native fetch with zero native dependencies, perfectly compatible with Node.js & Edge runtimes.
 */
export class UpstashRedisRateLimiterStore implements RateLimiterStore {
  readonly name = "upstash-redis";
  private baseUrl: string;
  private token: string;

  constructor(url: string, token: string) {
    this.baseUrl = url.replace(/\/+$/, "");
    this.token = token;
  }

  private async executeCommand<T = unknown>(command: (string | number)[]): Promise<T> {
    const res = await fetch(`${this.baseUrl}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
    });

    if (!res.ok) {
      throw new Error(`Upstash Redis error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    if (data.error) {
      throw new Error(`Upstash command error: ${data.error}`);
    }
    return data.result as T;
  }

  private async executePipeline<T = unknown>(commands: (string | number)[][]): Promise<T[]> {
    const res = await fetch(`${this.baseUrl}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commands),
    });

    if (!res.ok) {
      throw new Error(`Upstash Pipeline error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data.map((item: { result?: unknown; error?: string }) => {
      if (item.error) throw new Error(`Pipeline item error: ${item.error}`);
      return item.result;
    }) as T[];
  }

  async get(key: string): Promise<RateLimitRecord | null> {
    try {
      const raw = await this.executeCommand<string | null>(["GET", key]);
      if (!raw) return null;
      return JSON.parse(raw) as RateLimitRecord;
    } catch (err) {
      console.error("[RateLimiter:Upstash] get error:", err);
      return null;
    }
  }

  async check(key: string, maxAttempts: number): Promise<RateLimitCheckResult> {
    const blockKey = `${key}:blocked`;
    const countKey = `${key}:count`;
    try {
      const blockedTtl = await this.executeCommand<number>(["PTTL", blockKey]);
      if (blockedTtl > 0) {
        return {
          isBlocked: true,
          remaining: 0,
          retryAfterSeconds: Math.ceil(blockedTtl / 1000),
          storeName: this.name,
        };
      }
      const rawCount = await this.executeCommand<string | null>(["GET", countKey]);
      const attempts = rawCount ? parseInt(rawCount, 10) : 0;
      return {
        isBlocked: false,
        remaining: Math.max(0, maxAttempts - attempts),
        storeName: this.name,
      };
    } catch (err) {
      console.error("[RateLimiter:Upstash] check error:", err);
      if (process.env.NODE_ENV === "production") {
        return {
          isBlocked: true,
          remaining: 0,
          retryAfterSeconds: 60,
          failClosed: true,
          error: "DISTRIBUTED_STORE_UNAVAILABLE",
          storeName: this.name,
        };
      }
      return { isBlocked: false, remaining: maxAttempts, storeName: this.name };
    }
  }

  async increment(
    key: string,
    windowMs: number,
    maxAttempts: number,
    blockDurationMs: number
  ): Promise<RateLimitCheckResult> {
    const now = Date.now();
    const blockKey = `${key}:blocked`;

    try {
      // 1. Check if key is actively blocked
      const blockedTtl = await this.executeCommand<number>(["PTTL", blockKey]);
      if (blockedTtl > 0) {
        return {
          isBlocked: true,
          remaining: 0,
          retryAfterSeconds: Math.ceil(blockedTtl / 1000),
          storeName: this.name,
        };
      }

      // 2. Atomic counter increment & expiration window
      const countKey = `${key}:count`;
      const pipelineResults = await this.executePipeline([
        ["INCR", countKey],
        ["PTTL", countKey],
      ]);

      const attempts = pipelineResults[0] as number;
      const ttl = pipelineResults[1] as number;

      // If new key or no TTL set, set TTL for sliding window
      if (ttl < 0) {
        await this.executeCommand(["PEXPIRE", countKey, windowMs]);
      }

      // 3. Exceeded threshold: place active block key
      if (attempts >= maxAttempts) {
        await this.executeCommand([
          "SET",
          blockKey,
          "1",
          "PX",
          blockDurationMs,
        ]);
        const retryAfterSeconds = Math.ceil(blockDurationMs / 1000);
        return {
          isBlocked: true,
          remaining: 0,
          retryAfterSeconds,
          storeName: this.name,
        };
      }

      return {
        isBlocked: false,
        remaining: Math.max(0, maxAttempts - attempts),
        storeName: this.name,
      };
    } catch (err) {
      console.error("[RateLimiter:Upstash] increment error:", err);
      // In production, failure to reach Redis should fail closed for safety
      if (process.env.NODE_ENV === "production") {
        return {
          isBlocked: true,
          remaining: 0,
          retryAfterSeconds: 60,
          failClosed: true,
          error: "DISTRIBUTED_STORE_UNAVAILABLE",
          storeName: this.name,
        };
      }
      // In non-prod, fallback to open
      return {
        isBlocked: false,
        remaining: 1,
        storeName: this.name,
      };
    }
  }

  async reset(key: string): Promise<void> {
    try {
      await this.executePipeline([
        ["DEL", `${key}:count`],
        ["DEL", `${key}:blocked`],
      ]);
    } catch (err) {
      console.error("[RateLimiter:Upstash] reset error:", err);
    }
  }
}

/**
 * Generic Redis Store adapter for standard Redis clients (ioredis, @redis/client, etc.)
 */
export interface GenericRedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options?: { px?: number; ex?: number }): Promise<unknown>;
  del(key: string | string[]): Promise<unknown>;
  incr(key: string): Promise<number>;
  pttl(key: string): Promise<number>;
  pexpire(key: string, ms: number): Promise<unknown>;
}

export class GenericRedisRateLimiterStore implements RateLimiterStore {
  readonly name = "redis";
  private client: GenericRedisClient;

  constructor(client: GenericRedisClient) {
    this.client = client;
  }

  async get(key: string): Promise<RateLimitRecord | null> {
    try {
      const raw = await this.client.get(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  async check(key: string, maxAttempts: number): Promise<RateLimitCheckResult> {
    const blockKey = `${key}:blocked`;
    const countKey = `${key}:count`;
    try {
      const blockedTtl = await this.client.pttl(blockKey);
      if (blockedTtl > 0) {
        return {
          isBlocked: true,
          remaining: 0,
          retryAfterSeconds: Math.ceil(blockedTtl / 1000),
          storeName: this.name,
        };
      }
      const rawCount = await this.client.get(countKey);
      const attempts = rawCount ? parseInt(rawCount, 10) : 0;
      return {
        isBlocked: false,
        remaining: Math.max(0, maxAttempts - attempts),
        storeName: this.name,
      };
    } catch (err) {
      console.error("[RateLimiter:Redis] check error:", err);
      if (process.env.NODE_ENV === "production") {
        return {
          isBlocked: true,
          remaining: 0,
          retryAfterSeconds: 60,
          failClosed: true,
          error: "DISTRIBUTED_STORE_UNAVAILABLE",
          storeName: this.name,
        };
      }
      return { isBlocked: false, remaining: maxAttempts, storeName: this.name };
    }
  }

  async increment(
    key: string,
    windowMs: number,
    maxAttempts: number,
    blockDurationMs: number
  ): Promise<RateLimitCheckResult> {
    const blockKey = `${key}:blocked`;
    const countKey = `${key}:count`;

    try {
      const blockedTtl = await this.client.pttl(blockKey);
      if (blockedTtl > 0) {
        return {
          isBlocked: true,
          remaining: 0,
          retryAfterSeconds: Math.ceil(blockedTtl / 1000),
          storeName: this.name,
        };
      }

      const attempts = await this.client.incr(countKey);
      const ttl = await this.client.pttl(countKey);
      if (ttl < 0) {
        await this.client.pexpire(countKey, windowMs);
      }

      if (attempts >= maxAttempts) {
        await this.client.set(blockKey, "1", { px: blockDurationMs });
        return {
          isBlocked: true,
          remaining: 0,
          retryAfterSeconds: Math.ceil(blockDurationMs / 1000),
          storeName: this.name,
        };
      }

      return {
        isBlocked: false,
        remaining: Math.max(0, maxAttempts - attempts),
        storeName: this.name,
      };
    } catch (err) {
      console.error("[RateLimiter:Redis] increment error:", err);
      if (process.env.NODE_ENV === "production") {
        return {
          isBlocked: true,
          remaining: 0,
          retryAfterSeconds: 60,
          failClosed: true,
          error: "DISTRIBUTED_STORE_UNAVAILABLE",
          storeName: this.name,
        };
      }
      return { isBlocked: false, remaining: 1, storeName: this.name };
    }
  }

  async reset(key: string): Promise<void> {
    try {
      await this.client.del([`${key}:count`, `${key}:blocked`]);
    } catch (err) {
      console.error("[RateLimiter:Redis] reset error:", err);
    }
  }
}

// ---------------------------------------------------------------------------
// 3. Store Factory Function
// ---------------------------------------------------------------------------

export function createDefaultRateLimiterStore(): RateLimiterStore {
  const isProduction = process.env.NODE_ENV === "production";
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  // 1. Upstash REST API configured
  if (upstashUrl && upstashToken) {
    return new UpstashRedisRateLimiterStore(upstashUrl, upstashToken);
  }

  // 2. Production mode check
  if (isProduction) {
    // Explicit insecure override for staging or emergency preview deployments
    if (process.env.ALLOW_INSECURE_IN_MEMORY_RATE_LIMITER === "true") {
      console.warn(
        "[SECURITY WARNING] ALLOW_INSECURE_IN_MEMORY_RATE_LIMITER is enabled in production. " +
        "Rate limiting state will NOT be shared across server instances!"
      );
      return new MemoryRateLimiterStore();
    }

    // Default secure production posture: fail-closed
    return new FailClosedRateLimiterStore();
  }

  // 3. Local/test environment: in-memory store
  return new MemoryRateLimiterStore();
}

// ---------------------------------------------------------------------------
// 4. RateLimiter Class
// ---------------------------------------------------------------------------

export class RateLimiter {
  private store: RateLimiterStore;
  private readonly windowMs: number;
  private readonly maxAttempts: number;
  private readonly blockDurationMs: number;
  private readonly keyPrefix: string;
  private readonly proxyConfig?: ClientIpExtractionOptions;

  constructor(options?: RateLimiterOptions) {
    this.windowMs = options?.windowMs ?? 10 * 60 * 1000;          // 10 minutes
    this.maxAttempts = options?.maxAttempts ?? 5;                  // 5 attempts
    this.blockDurationMs = options?.blockDurationMs ?? 15 * 60 * 1000; // 15 minutes
    this.keyPrefix = options?.keyPrefix ?? "rl:";
    this.proxyConfig = options?.proxyConfig;
    this.store = options?.store ?? createDefaultRateLimiterStore();
  }

  /**
   * Replaces or overrides the active storage backend (useful for tests or runtime configuration).
   */
  setStore(store: RateLimiterStore): void {
    this.store = store;
  }

  /**
   * Refreshes the store backend from current environment variables.
   */
  refreshStore(): void {
    this.store = createDefaultRateLimiterStore();
  }

  getStore(): RateLimiterStore {
    return this.store;
  }

  getStoreName(): string {
    return this.store.name;
  }

  private isFailClosedEnforced(): boolean {
    return this.store instanceof FailClosedRateLimiterStore || this.store.name === "fail-closed";
  }

  private getFailClosedResult(): RateLimitCheckResult {
    const msg =
      "CRITICAL: Rate limiter distributed storage (Redis/Upstash) is not configured in production. " +
      "Fail-closed policy enforced to prevent distributed brute-force attacks across stateless instances. " +
      "Configure UPSTASH_REDIS_REST_URL/TOKEN or REDIS_URL, or set ALLOW_INSECURE_IN_MEMORY_RATE_LIMITER=true for staging.";
    console.error(`[RateLimiter:fail-closed] ${msg}`);

    return {
      isBlocked: true,
      remaining: 0,
      retryAfterSeconds: 60,
      failClosed: true,
      error: "RATE_LIMIT_STORE_MISSING",
      storeName: "fail-closed",
    };
  }

  /**
   * Generates a composite rate limiting key combining client IP and an optional identifier (e.g. email).
   */
  getClientIdentifier(req: Request, identifier?: string): string {
    const ip = extractClientIp(req, this.proxyConfig);
    const normalizedIdentifier = identifier ? identifier.trim().toLowerCase() : "";
    return normalizedIdentifier ? `${this.keyPrefix}${ip}:${normalizedIdentifier}` : `${this.keyPrefix}${ip}`;
  }

  /**
   * Checks whether the given key is currently blocked without recording an attempt.
   */
  async check(key: string): Promise<RateLimitCheckResult> {
    if (this.isFailClosedEnforced()) {
      return this.getFailClosedResult();
    }
    return await this.store.check(key, this.maxAttempts);
  }

  /**
   * Records a failed attempt and updates blocking status.
   */
  async recordFailedAttempt(key: string): Promise<RateLimitCheckResult> {
    if (this.isFailClosedEnforced()) {
      return this.getFailClosedResult();
    }
    return await this.store.increment(
      key,
      this.windowMs,
      this.maxAttempts,
      this.blockDurationMs
    );
  }

  /**
   * Clears the rate limit tracking upon successful authentication.
   */
  async clear(key: string): Promise<void> {
    await this.store.reset(key);
  }
}

// ---------------------------------------------------------------------------
// 5. Default Singleton Instance for Authentication
// ---------------------------------------------------------------------------

export const authRateLimiter = new RateLimiter({
  keyPrefix: "rl:auth:",
  windowMs: 10 * 60 * 1000,          // 10 minutes window
  maxAttempts: 5,                     // 5 attempts allowed
  blockDurationMs: 15 * 60 * 1000,    // 15 minutes block
});
