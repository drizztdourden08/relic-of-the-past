/* @layer renderer-hud @kind component */
/**
 * HudMeter draws a horizontal bar whose OWN LENGTH is the quantity.
 *
 * THE BAR IS THE VALUE, NOT A FILL INSIDE A FRAME. There is no track: at half
 * the bar is half as long, border and radius intact, and nothing at all is
 * drawn where the rest of it would have been. A fixed frame with a fill inside
 * draws a long empty trough at low values (a shape the player has to read and
 * discard on every glance), and it makes "none draws nothing" a special case
 * instead of the end of a continuum.
 *
 * THE LANE IS NOT THE BAR. `width` is the space the element reserves and the
 * length the bar reaches at fraction 1; the `<svg>` is always that wide, so the
 * element's box never changes size with the value and nothing placed near it
 * can shuffle as the value moves.
 *
 * VECTOR, AND A PRIMITIVE. Two properties rule out both alternatives at once. A
 * rounded corner and a border that stays exactly one SNES pixel at every HUD
 * scale are the things a baked bitmap cannot hold. The corner would be a
 * staircase chosen at authoring time and the border would thicken with the scale,
 * so this is drawn instead of blitted. And raw `<svg>` markup belongs in a
 * primitive, so it is drawn HERE instead of inside the compound that gives it
 * its colours and its meaning.
 *
 * Everything this knows is geometry. What a length means, what a second band
 * says, and whether a meter should be drawn at all are the caller's; see
 * `HudMagicBar`.
 */
import { useId } from 'react';

interface HudMeterProps {
  /** The lane the bar lives in, SNES px. The bar is this long at fraction 1. */
  width: number;
  height: number;
  /** How much, 0..1. The bar is drawn at this share of `width`. Clamped. */
  fraction: number;
  /** Border thickness in SNES px. */
  frame: number;
  /** Outer corner radius in SNES px at FULL length; shortened with the bar. */
  radius: number;
  frameColor: string;
  fillColor: string;
  /** Lighter band across the top of each band. It is the bar's light source. */
  sheenColor: string;
  sheenOpacity: number;
  /** Stacked bands the interior splits into. 1 (the default) is one bar. */
  bands?: number;
  /** SNES px to CSS px. */
  scale: number;
}

/** The share of a band's height its sheen covers. */
const SHEEN_SHARE = 1 / 3;

/**
 * A corner may never eat more than a sixth of the bar's length, so at least two
 * thirds of every horizontal edge stays straight. A radius is authored against
 * the bar at full length, where "slight" is easy to judge; carry that same
 * number down to a 6px stub unchanged and both its ends become semicircles and
 * the stub reads as a lozenge, which is a different shape, not a shorter one.
 */
const MAX_RADIUS_SHARE = 1 / 6;

interface Band {
  y: number;
  h: number;
}

/** `count` equal bands down `height`, each separated by `gap`. */
const bandRows = (top: number, height: number, count: number, gap: number): Band[] => {
  const h = (height - gap * (count - 1)) / count;
  return Array.from({ length: count }, (_unused, i) => ({ y: top + i * (h + gap), h }));
};

const HudMeter = (props: HudMeterProps) => {
  const {
    width, height, fraction, frame, radius,
    frameColor, fillColor, sheenColor, sheenOpacity, bands = 1, scale,
  } = props;

  // useId's own value carries colons, which are legal in an id and illegal in
  // the url(#...) reference that has to find it again.
  const clipId = `meter-bar-${useId().replace(/:/g, '')}`;
  const filled = Math.min(Math.max(fraction, 0), 1);
  // A bar thinner than its own two borders plus a pixel of core is not a short
  // bar, it is a smudge of border. Any non-zero amount draws at least that.
  const barW = filled <= 0 ? 0 : Math.max(frame * 2 + 1, width * filled);
  const outerRadius = Math.min(radius, barW * MAX_RADIUS_SHARE);
  const innerW = barW - frame * 2;
  const innerH = height - frame * 2;
  const rows = bandRows(frame, innerH, Math.max(1, Math.floor(bands)), frame);

  return (
    <svg
      width={width * scale}
      height={height * scale}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: 'block' }}
      aria-hidden
    >
      {barW > 0 && (
        <>
          <defs>
            <clipPath id={clipId}>
              <rect
                x={frame} y={frame} width={innerW} height={innerH}
                rx={Math.max(0, outerRadius - frame)}
              />
            </clipPath>
          </defs>

          <rect
            x={frame / 2}
            y={frame / 2}
            width={barW - frame}
            height={height - frame}
            rx={outerRadius}
            fill={fillColor}
            stroke={frameColor}
            strokeWidth={frame}
          />

          <g clipPath={`url(#${clipId})`}>
            {rows.map((band, i) => (
              <g key={band.y}>
                <rect
                  x={frame} y={band.y} width={innerW} height={band.h * SHEEN_SHARE}
                  fill={sheenColor} opacity={sheenOpacity}
                />
                {i < rows.length - 1 && (
                  <rect
                    x={frame} y={band.y + band.h} width={innerW} height={frame}
                    fill={frameColor}
                  />
                )}
              </g>
            ))}
          </g>
        </>
      )}
    </svg>
  );
};

export { HudMeter };
export type { HudMeterProps };
