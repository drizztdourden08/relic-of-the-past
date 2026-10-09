/* @layer renderer-components @kind constants */
import type { SoundChannel } from '@rotp/game-data';
import type { TabItem } from '@drizztdourden08/tessera/primitives';
import { SOUND_CHANNEL_LABELS } from '@domains/packs/music/behavior/sound-names';

const SOUND_CHANNEL_TAGS: Record<SoundChannel, string> = {
  ambient: 'AMB', sfx1: 'SFX1', sfx2: 'SFX2',
};

const EFFECT_CHANNELS: SoundChannel[] = ['sfx1', 'sfx2'];

const STUDIO_TABS: TabItem[] = [
  { id: 'music', label: 'Music' },
  { id: 'ambient', label: SOUND_CHANNEL_LABELS.ambient },
  { id: 'effects', label: 'Effects' },
  { id: 'files', label: 'Files' },
];

const NAMES_SHOWN = 2;

export { SOUND_CHANNEL_TAGS, EFFECT_CHANNELS, STUDIO_TABS, NAMES_SHOWN };
