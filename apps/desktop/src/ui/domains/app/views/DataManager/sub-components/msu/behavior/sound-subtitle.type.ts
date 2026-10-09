/* @layer renderer-components @kind types */
import type { SoundChannel } from '@shared/types/msu-manifest';

interface SubtitleCounts {
  channel: SoundChannel;
  total: number;
  raisedCount: number;
  reachableCount: number;
  hiddenCount: number;
  showUnreachable: boolean;
}

export type { SubtitleCounts };
