/* @layer shared-game-data @kind types */
import type { SoundChannel } from '@shared/types/msu-manifest';

interface SoundNameRecord {
  channel: SoundChannel;
  id: number;
  name: string;
}

export type { SoundNameRecord };
