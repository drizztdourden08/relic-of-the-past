/* @layer renderer-components @kind logic */
// Ids are hex because that is how the game's tables and every disassembly note write them.
import type { SoundChannel } from '@shared/types/msu-manifest';

const SOUND_CHANNEL_LABELS: Record<SoundChannel, string> = {
  ambient: 'Ambient', sfx1: 'Effects 1', sfx2: 'Effects 2',
};

const SOUND_CHANNELS: readonly SoundChannel[] = ['ambient', 'sfx1', 'sfx2'];

const soundHexId = (soundId: number): string =>
  `0x${soundId.toString(16).toUpperCase().padStart(2, '0')}`;

export { SOUND_CHANNEL_LABELS, SOUND_CHANNELS, soundHexId };
