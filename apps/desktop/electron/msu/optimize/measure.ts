/* @layer electron-main @kind logic */
import { rm, stat } from 'fs/promises';
import { join } from 'path';
import type { OptimizeCandidate } from '@rotp/msu';
import { OPTIMIZE_SLICE_SECONDS } from '@rotp/msu';
import type { AudioSource } from './audio-source';
import { describeSource } from './audio-source';
import { encodeToTarget } from './flac-encode';
import { readLoopSample } from './loop-point';
import type { MeasureRequest } from './measure.type';

const measureBytes = async (
  request: MeasureRequest, source: AudioSource,
): Promise<number | null> => {
  const { tools, tempDir, filePath, index } = request;
  const duration = source.durationSeconds;
  if (duration === null || duration <= 0) return null;
  const seconds = Math.min(OPTIMIZE_SLICE_SECONDS, duration);
  const destPath = join(tempDir, `slice-${index}.flac`);
  try {
    await encodeToTarget(tools, { inputArgs: source.inputArgs, sourcePath: filePath, destPath, seconds });
    const sliced = (await stat(destPath)).size;
    return duration <= seconds ? sliced : Math.round((sliced / seconds) * duration);
  } catch {
    return null;
  } finally {
    await rm(destPath, { force: true }).catch(() => {});
  }
};

const excluded = (fileName: string, currentBytes: number): OptimizeCandidate => ({
  name: fileName, currentBytes, estimatedBytes: null, excludedBecause: 'unreadable', carryLoopSample: null,
});

const measureCandidate = async (request: MeasureRequest): Promise<OptimizeCandidate> => {
  const { tools, filePath, fileName, sizeBytes } = request;
  const source = await describeSource(tools, filePath, fileName, sizeBytes);
  if (source === null) return excluded(fileName, sizeBytes);
  return {
    name: fileName,
    currentBytes: sizeBytes,
    estimatedBytes: await measureBytes(request, source),
    excludedBecause: null,
    carryLoopSample: source.carriesLoopPoint ? await readLoopSample(filePath) : null,
  };
};

export { measureCandidate };
export type { MeasureRequest };
