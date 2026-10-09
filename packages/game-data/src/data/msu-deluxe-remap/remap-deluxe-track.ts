/* @layer shared-game-data @kind logic */
import type { RemapContext } from './msu-deluxe-remap.type';
import { ENTRANCE_TRACKS, NO_REPLACEMENT, OVERWORLD_AREA_TRACKS, TRACK_REMAP_KIND } from './msu-deluxe-remap.data';
import { REMAP_BY_AREA, REMAP_BY_ENTRANCE, REMAP_KEEP } from './msu-deluxe-remap.constants';

const remapDeluxeTrack = (track: number, ctx: RemapContext): number => {
  const kind = track < TRACK_REMAP_KIND.length ? TRACK_REMAP_KIND[track] : REMAP_KEEP;
  if (kind === REMAP_BY_AREA) {
    return ctx.overworldArea < OVERWORLD_AREA_TRACKS.length ? OVERWORLD_AREA_TRACKS[ctx.overworldArea] : track;
  }
  if (kind === REMAP_BY_ENTRANCE) {
    if (ctx.entrance >= ENTRANCE_TRACKS.length) return track;
    const replacement = ENTRANCE_TRACKS[ctx.entrance];
    return replacement === NO_REPLACEMENT ? track : replacement;
  }
  return track;
};

export { remapDeluxeTrack };
