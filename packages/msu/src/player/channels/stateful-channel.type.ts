/* @layer renderer-lib @kind types */
import type { createTrackLoader } from '../track-loader';
import type { ActiveLayer, ChannelResume, MsuChannelName, SoundProgram } from './channel.type';

interface ActiveProgram {
  id: number;
  startedAt: number;
  layers: ActiveLayer[];
}

interface StartProgramParams {
  ctx: BaseAudioContext;
  name: MsuChannelName;
  fadeGain: GainNode;
  loader: ReturnType<typeof createTrackLoader>;
  program: SoundProgram;
  resume: ChannelResume | null;
  isCurrent: () => boolean;
}

export type { ActiveProgram, StartProgramParams };
