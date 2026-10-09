/* @layer electron-main @kind logic */
import { stat } from 'fs/promises';
import type { ProbedAudio } from '@shared/types/audio-probe';
import { loadCache } from './load-cache';

const cachedProbe = async (filePath: string): Promise<ProbedAudio | null> => {
  const [cache, st] = await Promise.all([loadCache(), stat(filePath).catch(() => null)]);
  if (!st) return null;
  const hit = cache.get(filePath);
  return hit && hit.size === st.size && hit.mtimeMs === st.mtimeMs ? hit.probed : null;
};

export { cachedProbe };
