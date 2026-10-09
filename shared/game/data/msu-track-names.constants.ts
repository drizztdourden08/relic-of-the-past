/* @layer shared-game-data @kind constants */
import { recordsIn } from './registry';
import type { MsuTrackNameRecord } from './msu-track-names.type';

const files = import.meta.glob('./records/names/msu-tracks.ts', { eager: true });

const MSU_TRACK_NAMES_BY_NUMBER: ReadonlyMap<number, string> = new Map<number, string>(
  recordsIn<MsuTrackNameRecord>(files).map((record) => [record.trackNum, record.name]),
);

export { MSU_TRACK_NAMES_BY_NUMBER };
