import "server-only";

/**
 * A per-IP limit on the assistant, kept in memory. It resets when an instance restarts and isn't
 * shared between instances, so treat it as a demo guard. A production app should use a shared
 * store (Upstash, Vercel KV) or a Vercel Firewall rate-limit rule, and sign the shopper in first.
 */
const WINDOW_MS = 60_000;
export const REQUESTS_PER_MINUTE = 10;

const hits = new Map<string, number[]>();

export function allow(ip: string, now = Date.now()): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= REQUESTS_PER_MINUTE) {
    hits.set(ip, recent);
    return false;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 10_000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
    // Still full (many addresses in one minute): start over rather than grow without bound.
    if (hits.size > 10_000) hits.clear();
  }
  return true;
}

/**
 * The caller's IP. On Vercel the platform sets x-forwarded-for, so its first entry can be trusted.
 * Elsewhere a client can set that header itself: put the app behind a proxy that overwrites it,
 * or replace this with your host's own client-IP value.
 */
export function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}
