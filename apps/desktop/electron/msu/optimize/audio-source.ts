/* @layer electron-main @kind logic */
/**
 * How one pack file is handed to the encoder, and how long it is.
 *
 * An MSU-1 `.pcm` has no container: the format FIXES rate, channels and sample format,
 * so the decoder is told all three and the duration follows from the byte count.
 * Everything else carries a container, so a probe identifies it and reports duration;
 * an empty probe is a file this operation cannot touch.
 *
 * The eight-byte MSU-1 header is skipped. It is two whole sample frames, so leaving it
 * in would not shift the channels, just put one click at the very start.
 */
import type { ProbedAudio } from '@shared/types/audio-probe';
import {
  MSU1_CHANNELS, MSU1_HEADER_BYTES, MSU1_SAMPLE_RATE, msu1FrameCount,
} from '@shared/types/msu1-format';
import { probeFile } from '../../tools/ffmpeg-run';

/** The container-less format, which has to be described to the decoder in full. */
const MSU1_EXTENSION = 'pcm';

const MSU1_INPUT_ARGS = [
  '-f', 's16le',
  '-ar', String(MSU1_SAMPLE_RATE),
  '-ac', String(MSU1_CHANNELS),
  '-skip_initial_bytes', String(MSU1_HEADER_BYTES),
];

/** Lowercase, no dot. */
const extensionOf = (name: string): string => (name.split('.').pop() ?? '').toLowerCase();

interface AudioSource {
  /** Input options the decoder needs before `-i`. Empty for anything with a container. */
  inputArgs: string[];
  /** Seconds of audio, or null when even the probe could not say. */
  durationSeconds: number | null;
  /** True for the raw format whose header carries a repeat point. */
  carriesLoopPoint: boolean;
}

const msu1Source = (sizeBytes: number): AudioSource => ({
  inputArgs: MSU1_INPUT_ARGS,
  durationSeconds: msu1FrameCount(sizeBytes) / MSU1_SAMPLE_RATE,
  carriesLoopPoint: true,
});

const probedSource = (probed: ProbedAudio): AudioSource => ({
  inputArgs: [],
  durationSeconds: probed.durationSeconds,
  carriesLoopPoint: false,
});

/** null for a file nothing here can read. That is the only thing that drops a file from a run. */
const describeSource = async (
  filePath: string, fileName: string, sizeBytes: number,
): Promise<AudioSource | null> => {
  if (extensionOf(fileName) === MSU1_EXTENSION) return msu1Source(sizeBytes);
  const probed = await probeFile(filePath);
  return probed === null ? null : probedSource(probed);
};

export { describeSource, extensionOf };
export type { AudioSource };
