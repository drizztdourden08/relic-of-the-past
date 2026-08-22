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
import type { TabItem } from '@ds/primitives/TabBar';

const SOUND_CHANNEL_LABELS: Record<SoundChannel, string> = {
  ambient: 'Ambient', sfx1: 'Effects 1', sfx2: 'Effects 2',
};

type StudioTab = 'music' | SoundChannel;

/** Music first: it is what the studio has always opened on, and what most packs only have. */
const STUDIO_TABS: TabItem[] = [
  { id: 'music', label: 'Music' },
  { id: 'ambient', label: SOUND_CHANNEL_LABELS.ambient },
  { id: 'sfx1', label: SOUND_CHANNEL_LABELS.sfx1 },
  { id: 'sfx2', label: SOUND_CHANNEL_LABELS.sfx2 },
];

const soundHexId = (soundId: number): string =>
  `0x${soundId.toString(16).toUpperCase().padStart(2, '0')}`;

/** `Ambient 0x05` — how one sound is named wherever it appears on its own. */
const soundTitle = (channel: SoundChannel, soundId: number): string =>
  `${SOUND_CHANNEL_LABELS[channel]} ${soundHexId(soundId)}`;

/** How many trigger names fit on a row before the rest become a count. */
const TRIGGERS_SHOWN = 2;

/**
 * The trigger list as one readable line: the busiest couple of names, then how many more there
 * are. The full list stays available as the row's tooltip — a sound raised from nine places
 * would otherwise wrap the row into a paragraph.
 */
const triggerSummary = (triggers: string[]): string => {
  const shown = triggers.slice(0, TRIGGERS_SHOWN).join(' · ');
  const rest = triggers.length - TRIGGERS_SHOWN;
  return rest > 0 ? `${shown} +${rest} more` : shown;
};

export { SOUND_CHANNEL_LABELS, STUDIO_TABS, soundHexId, soundTitle, triggerSummary };
export type { StudioTab };
