/* @layer bridge-wasm @kind types */
import type { SoundChannel } from '@rotp/game-data';

interface SoundReplacement {
  ambient: boolean;
  sfx: boolean;
}

type ClaimedCounts = Record<SoundChannel, number>;

export type { ClaimedCounts, SoundReplacement };
