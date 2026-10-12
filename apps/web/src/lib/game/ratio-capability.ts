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

const BASE_WIDTH = 256;
const BASE_HEIGHT = 224;
const STOCK_TILEMAP_WIDTH = 512;
const ULTRAWIDE_RATIO = 21 / 9;

const effectiveExtendY = (s: GameSettings): boolean => s.aspectRatio !== 'original' || s.extendY;
const renderHeight = (s: GameSettings): number => effectiveExtendY(s) ? 240 : BASE_HEIGHT;
const baseRatio = (s: GameSettings): number => BASE_WIDTH / renderHeight(s);

/** The ratio the settings ask for, before any capability is considered. */
const requestedRatio = (s: GameSettings): number =>
  s.aspectRatio === 'original'
    ? baseRatio(s)
    : aspectRatioValue(s.aspectRatio, s.customAspectW, s.customAspectH, s.renderIntoNotch);

/**
 * The ratio to render: the requested one, pulled back to what the switched-on capabilities support.
 * A profile with everything off renders 4:3, which is what the core would do anyway.
 */
const allowedRatio = (s: GameSettings): number => {
  const wanted = requestedRatio(s);
  if (!s.extendedRendering || wanted <= 0) return BASE_WIDTH / BASE_HEIGHT;
  if (s.aspectRatio === 'original') return wanted;
  const base = baseRatio(s);
  if (wanted < base) return s.tallRendering ? wanted : base;
  const linearLimit = STOCK_TILEMAP_WIDTH / renderHeight(s);
  if (!s.linearWorldTilemap && wanted > linearLimit) return linearLimit;
  if (!s.ultrawideRendering && wanted > ULTRAWIDE_RATIO) return ULTRAWIDE_RATIO;
  return wanted;
};

/** True when the view the profile renders is wider than the original picture. */
const rendersWide = (s: GameSettings): boolean => s.extendedRendering && s.aspectRatio !== 'original' && allowedRatio(s) > baseRatio(s);

/** True when it is taller. */
const rendersTall = (s: GameSettings): boolean => s.extendedRendering && s.aspectRatio !== 'original' && allowedRatio(s) < baseRatio(s);

/**
 * True when the view shows more than the original picture on any side, wider or taller. The
 * widescreen corrections answer to this: a tall view has the same transitions, effects and sprites
 * drawn for the original screen, so it needs them too.
 */
const rendersExtended = (s: GameSettings): boolean =>
  s.extendedRendering && s.aspectRatio !== 'original' &&
  Math.abs(allowedRatio(s) - baseRatio(s)) > 1e-6;

/**
 * The "W:H" word the core's config parser reads. Keep the rendered pixel dimensions unreduced:
 * reducing 320:240 to 4:3 selects the core's legacy 4:3 branch, which adds no columns.
 * The core adds columns in pairs, so round to the nearest width it can actually render.
 */
const ratioToString = (ratio: number, height: number): string => {
  const width = Math.max(2, Math.round(ratio * height / 2) * 2);
  return `${width}:${height}`;
};

export { allowedRatio, requestedRatio, rendersWide, rendersTall, rendersExtended, ratioToString, renderHeight, effectiveExtendY };
