/* @layer renderer-components @kind logic */
// Ids are hex because that is how the game's tables and every disassembly note write them.
import type { SoundChannel } from '@shared/types/msu-manifest';
import { SOUND_CHANNEL_PORTS } from '@shared/game/data/game-sounds';
import type { TabItem } from '@ds/primitives/TabBar';

const SOUND_CHANNEL_LABELS: Record<SoundChannel, string> = {
  ambient: 'Ambient', sfx1: 'Effects 1', sfx2: 'Effects 2',
};

/** Row tag for a list holding more than one channel; must stay legible at id-column width. */
const SOUND_CHANNEL_TAGS: Record<SoundChannel, string> = {
  ambient: 'AMB', sfx1: 'SFX1', sfx2: 'SFX2',
};

/** The two effect channels. They share a tab but are SEPARATE id spaces, so every row is tagged. */
const EFFECT_CHANNELS: SoundChannel[] = ['sfx1', 'sfx2'];

type StudioTab = 'music' | 'ambient' | 'effects' | 'files';

// Music first (what most packs only have); Files last (the pool, not something the game asks for).
const STUDIO_TABS: TabItem[] = [
  { id: 'music', label: 'Music' },
  { id: 'ambient', label: SOUND_CHANNEL_LABELS.ambient },
  { id: 'effects', label: 'Effects' },
  { id: 'files', label: 'Files' },
];

const soundHexId = (soundId: number): string =>
  `0x${soundId.toString(16).toUpperCase().padStart(2, '0')}`;

/** How one sound is named wherever it appears on its own, like `Ambient 0x05`. */
const soundTitle = (channel: SoundChannel, soundId: number): string =>
  `${SOUND_CHANNEL_LABELS[channel]} ${soundHexId(soundId)}`;

/** What a row is tagged with when its list holds more than one channel, like `SFX1`. */
const soundChannelTag = (channel: SoundChannel): string => SOUND_CHANNEL_TAGS[channel];

/** `Effects 1 · port APUI02`: the tooltip behind that tag. */
const soundChannelPort = (channel: SoundChannel): string =>
  `${SOUND_CHANNEL_LABELS[channel]} · port ${SOUND_CHANNEL_PORTS[channel]}`;

/** How many names fit on a row before the rest become a count. */
const NAMES_SHOWN = 2;

/** The first couple of names, then a count. The full list stays on the row's tooltip. */
const listSummary = (names: string[]): string => {
  const shown = names.slice(0, NAMES_SHOWN).join(' · ');
  const rest = names.length - NAMES_SHOWN;
  return rest > 0 ? `${shown} +${rest} more` : shown;
};

/** The game functions that raise a sound, as one line. */
const triggerSummary = (triggers: string[]): string => listSummary(triggers);

export {
  SOUND_CHANNEL_LABELS, SOUND_CHANNEL_TAGS, EFFECT_CHANNELS, STUDIO_TABS,
  soundHexId, soundTitle, soundChannelTag, soundChannelPort, listSummary, triggerSummary,
};
export type { StudioTab };
