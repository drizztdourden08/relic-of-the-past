/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { SoundChannel } from '@rotp/game-data';
import type { StudioTabItem } from './sound-labels.type';

const SOUND_CHANNEL_TAGS: Record<SoundChannel, string> = {
  ambient: 'AMB', sfx1: 'SFX1', sfx2: 'SFX2',
};

const EFFECT_CHANNELS: readonly [SoundChannel, SoundChannel] = ['sfx1', 'sfx2'];

const STUDIO_TABS: StudioTabItem[] = [
  { id: 'music', label: msg('msu-studio:studio.tabs.music') },
  { id: 'ambient', label: msg('msu-studio:studio.tabs.ambient') },
  { id: 'effects', label: msg('msu-studio:studio.tabs.effects') },
  { id: 'files', label: msg('msu-studio:studio.tabs.files') },
];

const NAMES_SHOWN = 2;

export { SOUND_CHANNEL_TAGS, EFFECT_CHANNELS, STUDIO_TABS, NAMES_SHOWN };
