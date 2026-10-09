/* @layer shared-game-data @kind logic */
import type { SoundChannel } from '../../manifest/msu-manifest.type';

const soundKey = (channel: SoundChannel, id: number): string => `${channel}:${id}`;

export { soundKey };
