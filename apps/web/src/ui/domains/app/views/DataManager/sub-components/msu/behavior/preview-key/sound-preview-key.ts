/* @layer renderer-components @kind logic */
import type { SoundChannel } from '@shared/types/msu-manifest';

const soundPreviewKey = (channel: SoundChannel, soundId: number): string =>
  `sound:${channel}:${soundId}`;

export { soundPreviewKey };
