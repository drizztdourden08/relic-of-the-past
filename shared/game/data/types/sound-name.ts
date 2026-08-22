/* @layer shared-game @kind types */
import type { SoundChannel } from '@shared/types/msu-manifest';

/**
 * One sound's plain-language name. A record rather than a keyed object because the records under
 * `records/` are collected by scanning array exports (see collect-records.ts).
 */
interface SoundNameRecord {
  channel: SoundChannel;
  /** The id as the game writes it, before the pan bits. */
  id: number;
  name: string;
}

export type { SoundNameRecord };
