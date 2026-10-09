/* @layer electron-main @kind logic */
import type { CacheEntry } from './probe-cache.type';

const probeCacheState = {
  entries: null as Map<string, CacheEntry> | null,
  flushTimer: null as ReturnType<typeof setTimeout> | null,
};

export { probeCacheState };
