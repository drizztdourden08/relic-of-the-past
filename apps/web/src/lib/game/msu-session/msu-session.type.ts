/* @layer bridge-wasm @kind types */
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import type { MsuEngine } from '../../msu/engine';
import type { LoadBytes } from '../../msu/track-loader';

interface MsuSessionOptions {
  manifest: MsuPackManifest;
  loadBytes: LoadBytes;
  isDeluxe: boolean;
  musicVolume: () => number;
  sfxVolume: () => number;
  ambientVolume: () => number;
  resumeEnabled: () => boolean;
  resetAtTitle: () => boolean;
  replaceAmbient: boolean;
  replaceSfx: boolean;
}

type MsuSessionState = {
  engine: MsuEngine | null;
  pending: MsuSessionOptions | null;
  pollId: ReturnType<typeof setInterval> | null;
};

declare global {
  interface Window {
    __onMusicCtrl?: (ctrl: number, module: number, entrance: number, overworldArea: number) => void;
    __onGameSound?: (channel: number, id: number, pan: number) => void;
    __msuIsPlaying?: (ctrl: number, module: number, entrance: number, overworldArea: number) => boolean;
  }
}

export type { MsuSessionOptions, MsuSessionState };
