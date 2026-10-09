/* @layer renderer-components @kind types */
import type { SoundChannel } from '@rotp/game-data';

interface SubtitleCounts {
  channel: SoundChannel;
  total: number;
  raisedCount: number;
  reachableCount: number;
  hiddenCount: number;
  showUnreachable: boolean;
}

export type { SubtitleCounts };
