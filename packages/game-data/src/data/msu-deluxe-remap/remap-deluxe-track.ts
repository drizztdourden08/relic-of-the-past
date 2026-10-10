/* @layer shared-game-data @kind logic */
import type { RemapContext } from './msu-deluxe-remap.type';
import { ENTRANCE_TRACKS, NO_REPLACEMENT, OVERWORLD_AREA_TRACKS, TRACK_REMAP_KIND } from './msu-deluxe-remap-tables.constants';
import { REMAP_BY_AREA, REMAP_BY_ENTRANCE, REMAP_KEEP } from './msu-deluxe-remap.constants';

const remapDeluxeTrack = (track: number, ctx: RemapContext): number => {
  const kind = TRACK_REMAP_KIND[track] ?? REMAP_KEEP;
  if (kind === REMAP_BY_AREA) return OVERWORLD_AREA_TRACKS[ctx.overworldArea] ?? track;
  if (kind === REMAP_BY_ENTRANCE) {
    const replacement = ENTRANCE_TRACKS[ctx.entrance];
    return replacement === undefined || replacement === NO_REPLACEMENT ? track : replacement;
  }
  return track;
};

export { remapDeluxeTrack };
