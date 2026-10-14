/* @layer renderer-lib @kind types */
import type { LoadedLayer } from '../track-loader';
import type { ActiveLayer, MsuChannelName, SoundProgram } from './channel.type';
import type { TriggerPool } from './trigger-pool.type';

interface LiveSet {
  id: number;
  startedAt: number;
  layers: ActiveLayer[];
  out: AudioNode;
}

interface LiveSets {
  prune: () => void;
  add: (set: LiveSet) => void;
  clear: () => void;
  newest: () => LiveSet | undefined;
  size: () => number;
}

interface StartSetParams {
  ctx: BaseAudioContext;
  fadeGain: GainNode;
  name: MsuChannelName;
  program: SoundProgram;
  loaded: LoadedLayer[];
  pool: TriggerPool;
  pan: number;
}

export type { LiveSet, LiveSets, StartSetParams };
