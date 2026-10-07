/* @layer shared-game-data @kind data */
/**
 * Looks up the name of one of the game's music slots.
 *
 * Only the NAMES are records. Which slots exist is a property of the format, so the panel
 * counts the vanilla range out itself instead of reading the list off here: a slot with no
 * name still has to appear, reading as its number.
 */
import { recordsIn } from './registry';

interface MsuTrackNameRecord {
  trackNum: number;
  name: string;
}

const files = import.meta.glob('./records/names/msu-tracks.ts', { eager: true });

const NAMES = new Map<number, string>(
  recordsIn<MsuTrackNameRecord>(files).map((record) => [record.trackNum, record.name]),
);

/** The name for one music slot, or null when the dataset has none for it. */
const msuTrackName = (trackNum: number): string | null => NAMES.get(trackNum) ?? null;

export { msuTrackName };
export type { MsuTrackNameRecord };
