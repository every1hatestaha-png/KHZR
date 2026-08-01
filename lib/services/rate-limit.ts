import "server-only"

import { headers } from "next/headers"

type Bucket = { windowStart: number; count: number }

const buckets = new Map<string, Bucket>()

const MAX_BUCKETS = 10_000
const SWEEP_WINDOW_MS = 60 * 60 * 1000

function sweep(now: number) {
  if (buckets.size < MAX_BUCKETS) return
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart > SWEEP_WINDOW_MS) buckets.delete(key)
  }
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
  const store = await headers()
  const ip =
    store.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    store.get("x-real-ip")?.trim()
  if (!ip) return true

  const now = Date.now()
  const key = `${scope}:${ip}`
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
