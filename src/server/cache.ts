import { createHash } from "node:crypto";

/**
 * Small in-memory LRU with a TTL, so repeated checks (e.g. demo examples) don't burn the free Gemini
 * quota. Keys are SHA-256 hashes, so message text is never kept as a key.
 */
export class LruCache<V> {
  private readonly entries = new Map<string, { value: V; expiresAt: number }>();

  constructor(
    private readonly maxEntries = 200,
    private readonly ttlMs = 60 * 60 * 1000,
    private readonly now: () => number = Date.now,
  ) {}

  get size(): number {
    return this.entries.size;
  }

  get(key: string): V | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    this.entries.delete(key);
    if (entry.expiresAt <= this.now()) return undefined;
    // Re-insert to mark as most recently used.
    this.entries.set(key, entry);
    return entry.value;
  }

  set(key: string, value: V): void {
    this.entries.delete(key);
    this.entries.set(key, { value, expiresAt: this.now() + this.ttlMs });
    while (this.entries.size > this.maxEntries) {
      const oldestKey = this.entries.keys().next().value;
      if (oldestKey === undefined) break;
      this.entries.delete(oldestKey);
    }
  }
}

export function hashKey(...parts: readonly (string | undefined)[]): string {
  const hash = createHash("sha256");
  for (const part of parts) hash.update(part ?? "").update("\u0000");
  return hash.digest("hex");
}
