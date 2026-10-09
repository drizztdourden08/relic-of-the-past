/* @layer renderer-lib @kind types */
import type { MsuPackManifest } from '@rotp/game-data';
import type { LayerReport } from './channel';
import type { LoadBytes } from './track-loader';
import type { createMsuEngine } from './engine';

interface MsuEngineOptions {
  ctx: BaseAudioContext;
  destination: AudioNode;
  manifest: MsuPackManifest;
  loadBytes: LoadBytes;
  isDeluxe: boolean;
  musicVolume: () => number;
  sfxVolume?: () => number;
  ambientVolume?: () => number;
  resumeEnabled?: () => boolean;
  resetAtTitle?: () => boolean;
  onError?: (message: string) => void;
  onReset?: () => void;
  onTrack?: (trackNum: number, layerCount: number, resumed: boolean) => void;
  onAmbient?: (soundId: number, layerCount: number, resumed: boolean) => void;
}

interface TrackReport {
  trackNum: number;
  elapsedSeconds: number;
  layers: LayerReport[];
}

type MsuEngine = ReturnType<typeof createMsuEngine>;

export type { MsuEngine, MsuEngineOptions, TrackReport };
