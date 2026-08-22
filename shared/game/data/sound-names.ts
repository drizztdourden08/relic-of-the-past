/* @layer shared-game-data @kind data */
/**
 * Looks up the plain-language name of one of the game's sounds.
 *
 * The names are NOT in this repository. They are the game's own vocabulary, so they live in the
 * private companion repo with the rest of the game-derived dataset and are copied in by
 * `npm run vault:sync`, the same way every other file under `records/` arrives. That is the whole
 * reason this module is a loader rather than a table: keeping the vocabulary out of a public repo
 * is a copyright position, not a filing preference.
 *
 * `import.meta.glob` resolves to an empty object when the record is absent, so a checkout without
 * vault access builds, lints and tests exactly the same and simply has no names. What the studio
 * falls back to is the list of functions that raise each sound, which is generated from the
 * decompiled source and is not game vocabulary.
 *
 * Naming these at all took cross-checking two independent sources — the community RAM map of the
 * sound-effect queue registers, and the call sites we generate from the source — so the record
 * carries the results of that and this side carries none of it.
 */
import { collectRecords } from './collect-records';
import type { SoundNameRecord } from './types';
import type { SoundChannel } from '@shared/types/msu-manifest';

const files = import.meta.glob('./records/sound-names.ts', { eager: true });

const keyOf = (channel: SoundChannel, id: number): string => `${channel}:${id}`;

const NAMES = new Map<string, string>(
  collectRecords<SoundNameRecord>(files).map((record) => [keyOf(record.channel, record.id), record.name]),
);

/** The name for one sound, or null when the dataset has none for it. */
const soundName = (channel: SoundChannel, id: number): string | null =>
  NAMES.get(keyOf(channel, id)) ?? null;

/** How many sounds on a channel carry a name, for a view that wants to say so. */
const namedSoundCount = (channel: SoundChannel): number =>
  [...NAMES.keys()].filter((key) => key.startsWith(`${channel}:`)).length;

export { soundName, namedSoundCount };
