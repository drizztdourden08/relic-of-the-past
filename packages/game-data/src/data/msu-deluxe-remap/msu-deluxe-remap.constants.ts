/* @layer shared-game-data @kind constants */
import { ENTRANCE_TRACKS, NO_REPLACEMENT, OVERWORLD_AREA_TRACKS } from './msu-deluxe-remap.data';

const REMAP_KEEP = 0;
const REMAP_BY_AREA = 1;
const REMAP_BY_ENTRANCE = 2;

const DELUXE_ENTRANCE_TRACKS: ReadonlyArray<number | null> =
  ENTRANCE_TRACKS.map((track) => (track === NO_REPLACEMENT ? null : track));

const DELUXE_TRACKS: ReadonlySet<number> = new Set([
  ...OVERWORLD_AREA_TRACKS,
  ...ENTRANCE_TRACKS.filter((track) => track !== NO_REPLACEMENT),
]);

export { DELUXE_ENTRANCE_TRACKS, DELUXE_TRACKS, REMAP_BY_AREA, REMAP_BY_ENTRANCE, REMAP_KEEP };
