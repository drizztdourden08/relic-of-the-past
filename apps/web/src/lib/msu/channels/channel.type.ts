/* @layer renderer-lib @kind types */
import type { LayerResume, MsuLayer, SoundChannel } from '@shared/types/msu-manifest';
import type { EffectChain } from '../layer-effects';
import type { LayerActivity, LayerScheduler } from '../schedulers/scheduler.type';
import type { LoadBytes } from '../track-loader';

type MsuChannelName = 'music' | SoundChannel;

type ChannelKind = 'stateful' | 'additive';

interface SoundProgram {
  id: number;
  layers: MsuLayer[];
  group?: string;
}

interface ActiveLayer {
  layerId: string;
  layerName: string;
  modeKind: string;
  scheduler: LayerScheduler;
  gain: GainNode;
  effects: EffectChain;
}

interface LayerReport extends LayerActivity {
  layerId: string;
  layerName: string;
  modeKind: string;
}

interface ChannelResume {
  id: number;
  layers: Record<string, LayerResume>;
}

interface ChannelReport {
  channel: MsuChannelName;
  kind: ChannelKind;
  id: number;
  elapsedSeconds: number;
  layers: LayerReport[];
  setCount: number;
  voiceCap: number | null;
}

interface ChannelOptions {
  ctx: BaseAudioContext;
  destination: AudioNode;
  name: MsuChannelName;
  kind: ChannelKind;
  programs: SoundProgram[];
  loadBytes: LoadBytes;
  cacheLimit?: number;
  resumeEnabled?: () => boolean;
  restartOnRepeat?: boolean;
  onError?: (message: string) => void;
  onStart?: (id: number, layerCount: number, resumed: boolean) => void;
}

interface SoundChannelApi {
  kind: ChannelKind;
  fadeNode: GainNode;
  trigger: (id: number, pan?: number) => void;
  activeId: () => number | null;
  snapshot: () => ChannelResume | null;
  restore: (state: ChannelResume | null) => void;
  forget: () => void;
  report: () => ChannelReport | null;
  stop: () => void;
  dispose: () => void;
}

export type {
  MsuChannelName, ChannelKind, SoundProgram, ActiveLayer, LayerReport,
  ChannelResume, ChannelReport, ChannelOptions, SoundChannelApi,
};
