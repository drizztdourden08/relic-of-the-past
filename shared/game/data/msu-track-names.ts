/* @layer shared-game-data @kind data */
/**
 * Looks up the name of one of the game's music slots.
 *
 * The names are NOT in this repository. They are the game's own vocabulary, so they live in the
 * private companion repo with the rest of the game-derived dataset and are copied in by
 * `npm run vault:sync`, the same way every other file under `records/` arrives. That is the whole
 * reason this module is a loader rather than a table: keeping the vocabulary out of a public repo
 * is a copyright position, not a filing preference.
 *
 * `import.meta.glob` resolves to an empty object when the record is absent, so a checkout without
 * vault access builds, lints and tests exactly the same, and every slot simply reads as its number.
 *
 * Only the NAMES come from outside. Which slots exist is a property of the format, so the panel
 * counts the vanilla range out itself — deriving the list from this dataset would turn a checkout
 * without vault access from "slots with no names" into "no slots at all".
 */
import { collectRecords } from './collect-records';

interface MsuTrackNameRecord {
  trackNum: number;
  name: string;
}

const files = import.meta.glob('./records/msu-track-names.ts', { eager: true });

const NAMES = new Map<number, string>(
  collectRecords<MsuTrackNameRecord>(files).map((record) => [record.trackNum, record.name]),
);

/** The name for one music slot, or null when the dataset has none for it. */
const msuTrackName = (trackNum: number): string | null => NAMES.get(trackNum) ?? null;

export { msuTrackName };
export type { MsuTrackNameRecord };
