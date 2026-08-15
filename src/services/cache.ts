/**
 * DataCache - High performance in-memory + sessionStorage cache
 * Enables instant tab switching (0ms latency) and stale-while-revalidate background sync.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

class SmartDataCache {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private readonly storagePrefix = 'lwork_cache_';

  /**
   * Get cached data. Returns the data even if slightly stale for instant UI rendering.
   */
  get<T>(key: string): T | null {
    // 1. Check memory cache (0ms)
    const memEntry = this.memoryCache.get(key);
    if (memEntry) {
      return memEntry.data as T;
    }

    // 2. Hydrate from sessionStorage (fast startup)
    try {
      const raw = sessionStorage.getItem(this.storagePrefix + key);
      if (raw) {
        const parsed: CacheEntry<T> = JSON.parse(raw);
        this.memoryCache.set(key, parsed);
        return parsed.data;
      }
    } catch {
      // Ignore storage parse errors
    }

    return null;
  }

  /**
   * Checks if data exists AND is still within its fresh TTL window.
   */
  isFresh(key: string): boolean {
    const entry = this.memoryCache.get(key);
    if (!entry) {
      try {
        const raw = sessionStorage.getItem(this.storagePrefix + key);
        if (!raw) return false;
        const parsed: CacheEntry<any> = JSON.parse(raw);
        this.memoryCache.set(key, parsed);
        return Date.now() - parsed.timestamp < parsed.ttlMs;
      } catch {
        return false;
      }
    }
    return Date.now() - entry.timestamp < entry.ttlMs;
  }

  /**
   * Store data in cache with a TTL (in milliseconds).
   */
  set<T>(key: string, data: T, ttlMs: number = 60_000): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttlMs,
    };
    this.memoryCache.set(key, entry);

    try {
      sessionStorage.setItem(this.storagePrefix + key, JSON.stringify(entry));
    } catch {
      // Storage quota or disabled, memory cache still works
    }
  }

  /**
   * Invalidate a specific cache key so next fetch triggers background revalidation.
   */
  invalidate(key: string): void {
    this.memoryCache.delete(key);
    try {
      sessionStorage.removeItem(this.storagePrefix + key);
    } catch {}
  }

  /**
   * Invalidate multiple keys at once.
   */
  invalidateMany(keys: string[]): void {
    for (const key of keys) {
      this.invalidate(key);
    }
  }

  /**
   * Clear all cached data (e.g. on logout).
   */
  clear(): void {
    this.memoryCache.clear();
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && k.startsWith(this.storagePrefix)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => sessionStorage.removeItem(k));
    } catch {}
  }
}

export const dataCache = new SmartDataCache();

// Standard TTL constants
export const CACHE_TTL = {
  JOBS: 45_000,          // 45s
  PROPOSALS: 30_000,     // 30s
  CONTRACTS: 45_000,     // 45s
  PAYMENTS: 60_000,      // 60s
  DOCUMENTS: 60_000,     // 60s
  NOTIFICATIONS: 15_000, // 15s
  METRICS: 60_000,       // 60s
  LAWYERS: 180_000,      // 3 min
  CHAT_CONVS: 20_000,    // 20s
  CHAT_MSGS: 120_000,    // 2 min (in-memory fast restore)
};
