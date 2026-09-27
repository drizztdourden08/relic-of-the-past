/* @layer shared-game-data @kind data */
/**
 * Looks up the plain-language name of one of the game's sounds.
 *
 * Naming these at all took cross-checking two independent sources, the community RAM map of the
 * sound-effect queue registers and the call sites we generate from the source. The record
 * carries the results of that and this side carries none of it. A sound the record has no name
 * for answers null, and the studio shows the function that raises it instead.
 */
import { recordsIn } from './registry';
import type { SoundChannel } from '@shared/types/msu-manifest';

interface SoundNameRecord {
  channel: SoundChannel;
  /** The id as the game writes it, before the pan bits. */
  id: number;
  name: string;
}

const files = import.meta.glob('./records/names/sounds.ts', { eager: true });

const keyOf = (channel: SoundChannel, id: number): string => `${channel}:${id}`;

const NAMES = new Map<string, string>(
  recordsIn<SoundNameRecord>(files).map((record) => [keyOf(record.channel, record.id), record.name]),
);

/** The name for one sound, or null when the dataset has none for it. */
const soundName = (channel: SoundChannel, id: number): string | null =>
  NAMES.get(keyOf(channel, id)) ?? null;

/** How many sounds on a channel carry a name, for a view that wants to say so. */
const namedSoundCount = (channel: SoundChannel): number =>
  [...NAMES.keys()].filter((key) => key.startsWith(`${channel}:`)).length;

export { soundName, namedSoundCount };
export type { SoundNameRecord };
