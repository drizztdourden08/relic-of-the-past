/* @layer renderer-hud @kind component */
/**
 * HudHeart draws one heart of the life meter instead of blitting it.
 *
 * TWO THINGS THE SPRITES COULD NOT DO, which is why this is a drawing:
 *
 *  · **Fill is a fraction, not a state.** `fill` is 0..1 and the body is clipped
 *    at exactly that share of the width. Full/half/empty are three points on
 *    that line, not three assets, so the smooth heart mode has real
 *    intermediate states to travel through instead of a crossfade between two
 *    pictures of a half heart.
 *  · **The armour tier tints the same drawing.** `armor` picks a rim, a
 *    highlight and a shaded flank; the body stays red. See the constants file
 *    for why the tint is slight.
 *
 * The two modes differ only in what the caller hands in and whether the cut
 * travels: `original` gets the console's own quantised fills and moves the clip
 * instantly, `smooth` gets the true fraction and eases it. The mode is not
 * re-derived here. `HudLife` owns the quantising, because it is the one that
 * knows the save's health units.
 */
import { useId } from 'react';
import {
  HEART_EMPTY, HEART_FILL, HEART_FILL_MS, HEART_HIGHLIGHT_OPACITY, HEART_HIGHLIGHT_PATH,
  HEART_OUTLINE, HEART_OUTLINE_WIDTH, HEART_PATH, HEART_RIM_OPACITY, HEART_RIM_WIDTH,
  HEART_SHADE_OPACITY, HEART_SHADE_PATH, HEART_VIEW, tintFor,
} from './HudHeart.constants';

type HeartMode = 'original' | 'smooth';

interface HudHeartProps {
  /** How full this heart is, 0..1. */
  fill: number;
  mode: HeartMode;
  /** Armour tier from the save, 0..2. Clamped, so an unknown tier is white. */
  armor?: number;
  /** SNES px to CSS px; a heart is 8 SNES px square. */
  scale: number;
}

/** One heart's side, in SNES pixels. */
const HEART_TILE = 8;

const HudHeart = (props: HudHeartProps) => {
  const { fill, mode, armor = 0, scale } = props;

  const side = HEART_TILE * scale;
  const tint = tintFor(armor);
  // useId's own value carries colons, which are legal in an id and illegal in
  // the url(#...) reference that has to find it again.
  const clipId = `heart-fill-${useId().replace(/:/g, '')}`;
  const cut = Math.min(Math.max(fill, 0), 1) * HEART_VIEW;

  return (
    <svg
      width={side}
      height={side}
      viewBox={`0 0 ${HEART_VIEW} ${HEART_VIEW}`}
      style={{ display: 'block' }}
      aria-hidden
    >
      <defs>
        <clipPath id={clipId}>
          <rect
            x={0}
            y={0}
            width={cut}
            height={HEART_VIEW}
            style={mode === 'smooth' ? { transition: `width ${HEART_FILL_MS}ms ease-out` } : undefined}
          />
        </clipPath>
      </defs>

      <path
        d={HEART_PATH}
        fill={HEART_EMPTY}
        stroke={HEART_OUTLINE}
        strokeWidth={HEART_OUTLINE_WIDTH}
        strokeLinejoin="round"
      />

      <g clipPath={`url(#${clipId})`}>
        <path d={HEART_PATH} fill={HEART_FILL} />
        <path d={HEART_SHADE_PATH} fill={tint.shade} opacity={HEART_SHADE_OPACITY} />
      </g>

      <path
        d={HEART_PATH}
        fill="none"
        stroke={tint.rim}
        strokeWidth={HEART_RIM_WIDTH}
        strokeLinejoin="round"
        opacity={HEART_RIM_OPACITY}
      />
      <path d={HEART_HIGHLIGHT_PATH} fill={tint.highlight} opacity={HEART_HIGHLIGHT_OPACITY} />
    </svg>
  );
};

export { HEART_TILE, HudHeart };
export type { HeartMode, HudHeartProps };
