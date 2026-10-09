/* @layer electron-main @kind logic */
import { readFile } from 'fs/promises';
import { cacheFile } from './cache-file';
import { probeCacheState } from './probe-cache-state';
import type { CacheEntry } from './probe-cache.type';

const loadCache = async (): Promise<Map<string, CacheEntry>> => {
  if (probeCacheState.entries) return probeCacheState.entries;
  try {
    const parsed = JSON.parse(await readFile(cacheFile(), 'utf8')) as Record<string, CacheEntry>;
    probeCacheState.entries = new Map(Object.entries(parsed));
  } catch {
    probeCacheState.entries = new Map();
  }
  return probeCacheState.entries;
};

export { loadCache };
