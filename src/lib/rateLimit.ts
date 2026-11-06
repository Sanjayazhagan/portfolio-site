// Small in-memory fixed-window limiter. The site runs as one Node process (PM2 on the VM),
// so process memory is a reasonable store; with several instances each one counts on its own.
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }
  bucket.count += 1;

  // Keep the map from growing without bound under lots of distinct keys.
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  }

  return { ok: bucket.count <= limit, retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
}

// First hop of X-Forwarded-For when a reverse proxy sets it. It can be spoofed when nothing
// overwrites it, so callers that guard something costly also apply a global cap.
export function clientIp(get: (name: string) => string | null | undefined) {
  const forwarded = get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return get("x-real-ip") ?? "unknown";
}
