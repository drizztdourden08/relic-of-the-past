/* @layer shared-game-data @kind constants */
import type { MsuTrackNameRecord } from './msu-track-names.type';

const files = import.meta.glob<{ default: MsuTrackNameRecord[] }>('../../data/msu-track-names.json', { eager: true });

const MSU_TRACK_NAMES_BY_NUMBER: ReadonlyMap<number, string> = new Map<number, string>(
  Object.values(files).flatMap((file) => file.default).map((record) => [record.trackNum, record.name]),
);

export { MSU_TRACK_NAMES_BY_NUMBER };
