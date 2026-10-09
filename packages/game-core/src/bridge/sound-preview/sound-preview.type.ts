/* @layer bridge-wasm @kind types */
import type { SoundChannel } from '@rotp/game-data';

type PreviewTarget = SoundChannel | 'music';

interface RenderedSound {
  samples: Int16Array;
  sampleRate: number;
  bank: number;
}

export type { PreviewTarget, RenderedSound };
