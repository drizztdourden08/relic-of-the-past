/* @layer electron-main @kind logic */
/**
 * Remembers what ffprobe said about a file, so it is asked once per file, not once per
 * draw of the files list (a native process launch per encoded file, per redraw).
 *
 * Keyed on path + size + mtime, so a rewritten file misses on its own and nothing is
 * invalidated by hand. Only a real answer is kept: a null (tool missing, file
 * unreadable) can change without the file changing, so it is asked again next time.
 *
 * Persisted as one JSON file under the app's data root, written at most once per second.
 */
import { mkdir, readFile, stat, writeFile } from 'fs/promises';
import { dirname } from 'path';
import type { ProbedAudio } from '@shared/types/audio-probe';
import { getUserDataPath } from '../lib/paths';

interface CacheEntry {
  size: number;
  mtimeMs: number;
  probed: ProbedAudio;
}

const FLUSH_DELAY_MS = 1000;

const cacheFile = (): string => getUserDataPath('cache', 'audio-probe.json');

let entries: Map<string, CacheEntry> | null = null;
let flushTimer: ReturnType<typeof setTimeout> | null = null;

const load = async (): Promise<Map<string, CacheEntry>> => {
  if (entries) return entries;
  try {
    const parsed = JSON.parse(await readFile(cacheFile(), 'utf8')) as Record<string, CacheEntry>;
    entries = new Map(Object.entries(parsed));
  } catch {
    entries = new Map();
  }
  return entries;
};

const scheduleFlush = (): void => {
  if (flushTimer !== null) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void (async () => {
      if (!entries) return;
      const file = cacheFile();
      await mkdir(dirname(file), { recursive: true });
      await writeFile(file, JSON.stringify(Object.fromEntries(entries)));
    })().catch(() => { /* a lost cache only costs a re-probe */ });
  }, FLUSH_DELAY_MS);
};

/** The remembered answer for `filePath` as it is on disk right now, or null to probe it. */
const cachedProbe = async (filePath: string): Promise<ProbedAudio | null> => {
  const [cache, st] = await Promise.all([load(), stat(filePath).catch(() => null)]);
  if (!st) return null;
  const hit = cache.get(filePath);
  return hit && hit.size === st.size && hit.mtimeMs === st.mtimeMs ? hit.probed : null;
};

/** Remember a real answer for `filePath` as it is on disk right now. */
const rememberProbe = async (filePath: string, probed: ProbedAudio): Promise<void> => {
  const [cache, st] = await Promise.all([load(), stat(filePath).catch(() => null)]);
  if (!st) return;
  cache.set(filePath, { size: st.size, mtimeMs: st.mtimeMs, probed });
  scheduleFlush();
};

export { cachedProbe, rememberProbe };
