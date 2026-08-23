/* @layer renderer-components @kind logic */
/**
 * How the studio writes a sound down.
 *
 * Ids are shown in hex because that is how the game's own tables and every note about them are
 * written; a decimal id would have to be converted by hand every time it is compared against a
 * disassembly. The catalogue supplies a plain-language name for only some ids, so the trigger
 * summary below is the description for all the rest.
 */
import type { SoundChannel } from '@shared/types/msu-manifest';
import { SOUND_CHANNEL_PORTS } from '@shared/game/data/game-sounds';
import type { TabItem } from '@ds/primitives/TabBar';

const SOUND_CHANNEL_LABELS: Record<SoundChannel, string> = {
  ambient: 'Ambient', sfx1: 'Effects 1', sfx2: 'Effects 2',
};

/**
 * The short tag a row carries when one list holds more than one channel. Kept as its own spelling
 * rather than a shortened label: it has to stay legible at the width of an id column.
 */
const SOUND_CHANNEL_TAGS: Record<SoundChannel, string> = {
  ambient: 'AMB', sfx1: 'SFX1', sfx2: 'SFX2',
};

/**
 * The two effect channels, in the order the effects tab stacks them.
 *
 * They share a tab because they are the same kind of thing — one-shot effects — but they are
 * SEPARATE id spaces: id 0x12 is one sound on the first port and a different sound on the second.
 * So the tab lists them as two sections and tags every row with its channel; it never merges them
 * into one numbered list, which would make the id ambiguous.
 */
const EFFECT_CHANNELS: SoundChannel[] = ['sfx1', 'sfx2'];

type StudioTab = 'music' | 'ambient' | 'effects' | 'files';

/**
 * Music first: it is what the studio has always opened on, and what most packs only have. Files
 * last, because it is the pool the other tabs draw from rather than something the game asks for —
 * it answers "what is actually in here", not "what plays when".
 */
const STUDIO_TABS: TabItem[] = [
  { id: 'music', label: 'Music' },
  { id: 'ambient', label: SOUND_CHANNEL_LABELS.ambient },
  { id: 'effects', label: 'Effects' },
  { id: 'files', label: 'Files' },
];

const soundHexId = (soundId: number): string =>
  `0x${soundId.toString(16).toUpperCase().padStart(2, '0')}`;

/** `Ambient 0x05` — how one sound is named wherever it appears on its own. */
const soundTitle = (channel: SoundChannel, soundId: number): string =>
  `${SOUND_CHANNEL_LABELS[channel]} ${soundHexId(soundId)}`;

/** `SFX1` — what a row is tagged with when its list holds more than one channel. */
const soundChannelTag = (channel: SoundChannel): string => SOUND_CHANNEL_TAGS[channel];

/**
 * `Effects 1 · port APUI02` — the tooltip behind that tag. The port is what makes two sections
 * that look alike provably different lists rather than a repeat of one.
 */
const soundChannelPort = (channel: SoundChannel): string =>
  `${SOUND_CHANNEL_LABELS[channel]} · port ${SOUND_CHANNEL_PORTS[channel]}`;

/** How many names fit on a row before the rest become a count. */
const NAMES_SHOWN = 2;

/**
 * A list of names as one readable line: the first couple of them, then how many more there are.
 * The full list stays available as the row's tooltip — nine names would otherwise wrap the row
 * into a paragraph.
 */
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
