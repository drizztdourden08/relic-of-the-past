/* @layer electron-main @kind logic */
/**
 * What one file would really cost in the target format.
 *
 * The number is measured, never assumed: FLAC on 16-bit stereo lands anywhere between 40% and
 * 70% of the source depending on how busy the material is, so a flat percentage would be a
 * guess wearing a number's clothes. A fixed slice is really encoded, and its bytes-per-second
 * is scaled to the file's own duration.
 *
 * A file shorter than the slice IS the slice, so its estimate is not scaled at all. It is
 * the exact size the conversion will produce.
 */
import { rm, stat } from 'fs/promises';
import { join } from 'path';
import type { OptimizeCandidate } from '@shared/types/msu-optimize';
import { OPTIMIZE_SLICE_SECONDS } from '@shared/types/msu-optimize';
import type { AudioSource } from './audio-source';
import { describeSource } from './audio-source';
import { encodeToTarget } from './flac-encode';
import { readLoopSample } from './loop-point';

interface MeasureRequest {
  ffmpegPath: string;
  /** Scratch directory the slice is written into and deleted from. */
  tempDir: string;
  filePath: string;
  fileName: string;
  sizeBytes: number;
  /** Distinguishes one file's slice from the next in the same scratch directory. */
  index: number;
}

/** Bytes the whole file is measured to come out at, or null when there is nothing to scale by. */
const measureBytes = async (
  request: MeasureRequest, source: AudioSource,
): Promise<number | null> => {
  const { ffmpegPath, tempDir, filePath, index } = request;
  const duration = source.durationSeconds;
  if (duration === null || duration <= 0) return null;
  const seconds = Math.min(OPTIMIZE_SLICE_SECONDS, duration);
  const destPath = join(tempDir, `slice-${index}.flac`);
  try {
    await encodeToTarget(ffmpegPath, { inputArgs: source.inputArgs, sourcePath: filePath, destPath, seconds });
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

/** One row of the preview: what the file costs now, what it would cost, and what has to move first. */
const measureCandidate = async (request: MeasureRequest): Promise<OptimizeCandidate> => {
  const { filePath, fileName, sizeBytes } = request;
  const source = await describeSource(filePath, fileName, sizeBytes);
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
