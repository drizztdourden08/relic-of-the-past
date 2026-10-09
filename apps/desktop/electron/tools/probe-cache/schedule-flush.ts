/* @layer electron-main @kind logic */
import { mkdir, writeFile } from 'fs/promises';
import { dirname } from 'path';
import { cacheFile } from './cache-file';
import { FLUSH_DELAY_MS } from './probe-cache.constants';
import { probeCacheState } from './probe-cache-state';

const flush = async (): Promise<void> => {
  const { entries } = probeCacheState;
  if (!entries) return;
  const file = cacheFile();
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(Object.fromEntries(entries)));
};

const scheduleFlush = (): void => {
  if (probeCacheState.flushTimer !== null) return;
  probeCacheState.flushTimer = setTimeout(() => {
    probeCacheState.flushTimer = null;
    void flush().catch(() => undefined);
  }, FLUSH_DELAY_MS);
};

export { scheduleFlush };
