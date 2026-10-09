/* @layer shared-types @kind types */
import type { BasedOn } from '@shared/store/based-on';

type LayerPlayMode =
  | { kind: 'once' }
  | {
    kind: 'loop';
    order: 'sequential' | 'random' | 'single';
    crossfadeSeconds?: number;
  }
  | {
    kind: 'random';
    minDelaySeconds: number;
    maxDelaySeconds: number;
    waitForCompletion?: boolean;
  }
  | { kind: 'interval'; atSeconds: number[] };

type LayerEffect =
  | { kind: 'lowpass'; frequencyHz: number }
  | { kind: 'highpass'; frequencyHz: number }
  | { kind: 'eq'; lowDb: number; midDb: number; highDb: number };

interface MsuLayer {
  id: string;
  name: string;
  files: string[];
  mode: LayerPlayMode;
  effects?: LayerEffect[];
  volume: number;
  chance?: number;
  loopSample?: number;
}

type SoundChannel = 'ambient' | 'sfx1' | 'sfx2';

interface MsuSoundDef {
  soundId: number;
  layers: MsuLayer[];
  syncGroup?: string;
}

interface MsuTrackDef {
  trackNum: number;
  layers: MsuLayer[];
}

interface MsuPackMeta {
  name: string;
  author?: string;
  description?: string;
  cover?: string;
  createdAt: number;
  modifiedAt: number;
  basedOn?: BasedOn;
}

interface MsuPackManifest {
  version: 1;
  meta: MsuPackMeta;
  tracks: MsuTrackDef[];
  sounds?: Partial<Record<SoundChannel, MsuSoundDef[]>>;
  files?: string[];
}

interface LayerResume {
  fileIndex: number;
  offsetSeconds: number;
  nextEventInSeconds: number | null;
}

interface MsuResumeState {
  trackNum: number;
  layers: Record<string, LayerResume>;
  ambient?: { soundId: number; layers: Record<string, LayerResume> } | null;
}

export type {
  LayerEffect,
  LayerPlayMode, MsuLayer, MsuTrackDef, MsuPackMeta, MsuPackManifest, LayerResume, MsuResumeState,
  SoundChannel, MsuSoundDef,
};
