/* @layer renderer-components @kind logic */
import type { SoundChannel } from '@rotp/game-data';

const soundPreviewKey = (channel: SoundChannel, soundId: number): string =>
  `sound:${channel}:${soundId}`;

export { soundPreviewKey };
