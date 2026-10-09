/* @layer shared-game-data @kind types */
import type { SoundChannel } from '../../manifest/msu-manifest.type';

interface SoundNameRecord {
  channel: SoundChannel;
  id: number;
  name: string;
}

export type { SoundNameRecord };
