/* @layer renderer-components @kind constants */
import type { SoundChannel } from '@rotp/game-data';

const SOUND_CHANNEL_LABELS: Record<SoundChannel, string> = {
  ambient: 'Ambient', sfx1: 'Effects 1', sfx2: 'Effects 2',
};

const SOUND_CHANNELS: readonly SoundChannel[] = ['ambient', 'sfx1', 'sfx2'];

export { SOUND_CHANNEL_LABELS, SOUND_CHANNELS };
