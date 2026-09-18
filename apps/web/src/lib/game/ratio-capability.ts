/* @layer bridge-wasm @kind logic */
/**
 * What ratio a profile may actually render, given the capabilities it has switched on.
 *
 * The preset picker gates its own entries: the widest ones need the world tilemap and the ultrawide
 * switch, the tall ones need tall rendering. Auto, Screen and Custom went around that, so a wide monitor
 * on Auto, or a tall Custom ratio, handed the core a shape whose capability bits were never set. The
 * thresholds here are the ones the settings migration already used to decide what an old profile needed.
 */
import { aspectRatioValue } from './aspect-ratio';
import type { GameSettings } from '@shared/types/settings';

/** Above this a ratio needs the linear world tilemap, because the stock 512px fetch runs out. */
const LINEAR_RATIO = 2.2;
/** Above this it also needs the ultrawide switch. */
const ULTRAWIDE_RATIO = 2.4;
/** Below this it is taller than the original picture and needs the tall renderer. */
const TALL_RATIO = 4 / 3;

/** The ratio the settings ask for, before any capability is considered. */
const requestedRatio = (s: GameSettings): number =>
  aspectRatioValue(s.aspectRatio, s.customAspectW, s.customAspectH);

/**
 * The ratio to render: the requested one, pulled back to what the switched-on capabilities support.
 * A profile with everything off renders 4:3, which is what the core would do anyway.
 */
const allowedRatio = (s: GameSettings): number => {
  const wanted = requestedRatio(s);
  if (!s.extendedRendering || wanted <= 0) return TALL_RATIO;
  if (wanted < TALL_RATIO) return s.tallRendering ? wanted : TALL_RATIO;
  if (wanted > ULTRAWIDE_RATIO && !s.ultrawideRendering) {
    return s.linearWorldTilemap ? ULTRAWIDE_RATIO : LINEAR_RATIO;
  }
  if (wanted > LINEAR_RATIO && !s.linearWorldTilemap) return LINEAR_RATIO;
  return wanted;
};

/** True when the view the profile renders is wider than the original picture. */
const rendersWide = (s: GameSettings): boolean => s.extendedRendering && allowedRatio(s) > TALL_RATIO;

/** True when it is taller. */
const rendersTall = (s: GameSettings): boolean => s.extendedRendering && allowedRatio(s) < TALL_RATIO;

/**
 * The "W:H" word the core's config parser reads. Built from the served height so the pair is exact for
 * the shape being asked for, and reduced, which is what the ratio pickers hand over too.
 */
const ratioToString = (ratio: number): string => {
  const height = 224;
  const width = Math.max(1, Math.round(ratio * height));
  const divide = (a: number, b: number): number => (b === 0 ? a : divide(b, a % b));
  const g = divide(width, height) || 1;
  return `${width / g}:${height / g}`;
};

export { allowedRatio, requestedRatio, rendersWide, rendersTall, ratioToString };
export { LINEAR_RATIO, ULTRAWIDE_RATIO, TALL_RATIO };
