/* @layer electron-main @kind logic */
/**
 * Remembers what ffprobe said about a file, so it is asked once per file rather than once per
 * look at the list.
 *
 * A probe is a native process launch, and the files list asks about every encoded file in the
 * pack each time it is drawn — after a pack has been converted that is a hundred launches in a
 * row, repeated by every rename and delete. The answer cannot change unless the bytes do, so the
 * key is the path plus the size and the modification time: a rewritten file misses on its own,
 * and nothing ever has to be invalidated by hand.
 *
 * Only a real answer is kept. A null means the tool was missing or the file unreadable, and both
 * of those can change without the file changing — installing ffmpeg is the obvious case — so a
 * null is asked again next time rather than remembered.
 *
 * Persisted as one JSON file under the app's own data root and written at most once per second,
 * so a burst of first-time probes costs one write rather than a hundred.
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
