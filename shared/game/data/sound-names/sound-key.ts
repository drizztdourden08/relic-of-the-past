/* @layer shared-game-data @kind logic */
import type { SoundChannel } from '@shared/types/msu-manifest';

const soundKey = (channel: SoundChannel, id: number): string => `${channel}:${id}`;

export { soundKey };
