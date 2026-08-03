import "server-only"

import { createHash } from "node:crypto"
import { headers } from "next/headers"

type Bucket = { windowStart: number; count: number }

const buckets = new Map<string, Bucket>()

const MAX_BUCKETS = 10_000
const SWEEP_WINDOW_MS = 60 * 60 * 1000

function hashKey(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 32)
}

function sweep(now: number) {
  if (buckets.size < MAX_BUCKETS) return
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart > SWEEP_WINDOW_MS) buckets.delete(key)
  }
}

function hitBucket(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const bucket = buckets.get(key)
  if (!bucket || now - bucket.windowStart > windowMs) {
    buckets.set(key, { windowStart: now, count: 1 })
    sweep(now)
    return true
  }
  if (bucket.count >= max) return false
  bucket.count += 1
  return true
}

async function hitSharedBucket(key: string, max: number, windowMs: number): Promise<boolean | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null

  const expiresInSeconds = Math.max(1, Math.ceil(windowMs / 1000))
  try {
    const response = await fetch(`${url.replace(/\/$/, "")}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, expiresInSeconds, "NX"],
      ]),
      cache: "no-store",
    })
    if (!response.ok) return null
    const data = await response.json() as Array<{ result?: unknown }>
    const count = Number(data[0]?.result ?? 0)
    if (!Number.isFinite(count) || count <= 0) return null
    return count <= max
  } catch (err) {
    console.error("[rate-limit] shared store unavailable:", err instanceof Error ? err.message : "unknown")
    return null
  }
}

async function hitRateLimit(scope: string, identity: string, max: number, windowMs: number): Promise<boolean> {
  const key = `rl:${scope}:${hashKey(identity)}`
  const shared = await hitSharedBucket(key, max, windowMs)
  if (shared !== null) return shared
  return hitBucket(key, max, windowMs)
}

export async function getClientIp(): Promise<string | null> {
  const store = await headers()
  return store.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    store.get("x-real-ip")?.trim() ??
    null
}

/**
 * Lightweight, per-IP, in-memory rate limit for server actions. Returns true
 * when the request is allowed. Falls open (no limit) when the caller's IP
 * cannot be determined. Note: this is per-instance; a multi-instance
 * deployment should move this to shared storage.
 */
export async function rateLimit(
  scope: string,
  max: number,
  windowMs = SWEEP_WINDOW_MS
): Promise<boolean> {
  const ip = await getClientIp()
  if (!ip) return true
  return hitRateLimit(scope, ip, max, windowMs)
}

export async function rateLimitKey(
  scope: string,
  key: string,
  max: number,
  windowMs = SWEEP_WINDOW_MS
): Promise<boolean> {
  const normalized = key.trim().toLowerCase()
  if (!normalized) return true
  return hitRateLimit(scope, normalized, max, windowMs)
}
