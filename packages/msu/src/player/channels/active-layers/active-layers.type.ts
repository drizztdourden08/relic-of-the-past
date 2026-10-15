/* @layer renderer-lib @kind types */
import type { LayerResume, MsuLayer } from '@rotp/game-data';
import type { LoadedLayer } from '../../track-loader';
import type { SoundProgram } from '../channel.type';

type ResumeFor = (layer: MsuLayer, fileCount: number) => LayerResume | null;

interface StartLayersParams {
  ctx: BaseAudioContext;
  destination: AudioNode;
  channel: string;
  program: SoundProgram;
  loaded: LoadedLayer[];
  elapsedSeconds: () => number;
  resumeFor: ResumeFor;
}

export type { StartLayersParams };
