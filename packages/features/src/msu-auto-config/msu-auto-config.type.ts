/* @layer shared-features @kind types */
import type { GameSettings } from '../settings';

interface MsuTrackInfo {
  trackNum: number;
  ext: string;
}

interface MsuPackProfile {
  isDeluxe: boolean;
  hasOpuz: boolean;
  isLayered: boolean;
}

interface ResolvedAudioConfig {
  enableMSU: GameSettings['enableMSU'];
  audioFreq: number;
  audioChannels: 1 | 2;
  audioSamples: number;
}

export type { MsuTrackInfo, MsuPackProfile, ResolvedAudioConfig };
