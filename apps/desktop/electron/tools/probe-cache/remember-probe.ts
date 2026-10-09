/* @layer electron-main @kind logic */
import { stat } from 'fs/promises';
import type { ProbedAudio } from '@shared/types/audio-probe';
import { loadCache } from './load-cache';
import { scheduleFlush } from './schedule-flush';

const rememberProbe = async (filePath: string, probed: ProbedAudio): Promise<void> => {
  const [cache, st] = await Promise.all([loadCache(), stat(filePath).catch(() => null)]);
  if (!st) return;
  cache.set(filePath, { size: st.size, mtimeMs: st.mtimeMs, probed });
  scheduleFlush();
};

export { rememberProbe };
