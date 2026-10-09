/* @layer electron-main @kind logic */
import type { ProbedAudio } from '@shared/types/audio-probe';
import { MSU1_SAMPLE_RATE, msu1FrameCount } from '@shared/types/msu1-format';
import { probeFile } from '../../tools/ffmpeg-run';
import { MSU1_EXTENSION, MSU1_INPUT_ARGS } from './audio-source.constants';
import type { AudioSource } from './audio-source.type';
import { extensionOf } from './extension-of';

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

const describeSource = async (
  filePath: string, fileName: string, sizeBytes: number,
): Promise<AudioSource | null> => {
  if (extensionOf(fileName) === MSU1_EXTENSION) return msu1Source(sizeBytes);
  const probed = await probeFile(filePath);
  return probed === null ? null : probedSource(probed);
};

export { describeSource };
export type { AudioSource };
