/* @layer renderer-components @kind component */
/**
 * How far a byte has moved from its baseline, drawn on the top border of its
 * cell. Deliberately not a fill, border or text color: "changed" has to be
 * readable on top of whatever state the cell already carries (picked, claimed,
 * excluded), and it is what the exclude workflow is judged against.
 *
 * A byte with a direction (an axis) grows from the centre toward the left for
 * negative and the right for positive, reaching the corner at full travel. A
 * byte with no meaningful direction (a bitmask) grows from the centre both ways
 * at once. Colour encodes magnitude, green through amber to red.
 */
import type { CSSProperties } from 'react';
import { Box } from '../../../../../../../design-system/primitives/Box';

/** Data-viz ramp: fixed hues that encode magnitude, not theme colors. */
const RAMP: { at: number; rgb: [number, number, number] }[] = [
  { at: 0, rgb: [74, 222, 128] },
  { at: 0.5, rgb: [251, 191, 36] },
  { at: 0.75, rgb: [251, 146, 60] },
  { at: 1, rgb: [248, 113, 113] },
];

const lerp = (a: number, b: number, t: number): number => Math.round(a + (b - a) * t);

const rampColor = (magnitude: number): string => {
  for (let i = 1; i < RAMP.length; i++) {
    const hi = RAMP[i];
    if (magnitude > hi.at && i < RAMP.length - 1) continue;
    const lo = RAMP[i - 1];
    const t = hi.at === lo.at ? 0 : (magnitude - lo.at) / (hi.at - lo.at);
    const c = [0, 1, 2].map((k) => lerp(lo.rgb[k], hi.rgb[k], Math.min(1, Math.max(0, t))));
    return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
  }
  return `rgb(${RAMP[0].rgb.join(', ')})`;
};

interface ByteChangeDotProps {
  /** Current value minus baseline. Zero (or no baseline) draws nothing. */
  delta: number;
  /** Travel that counts as maximum change. A byte resting mid-range moves +-128. */
  span?: number;
  /** False for values whose sign carries no meaning, e.g. a button bitmask. */
  signed: boolean;
}

const ByteChangeDot = ({ delta, span = 128, signed }: ByteChangeDotProps) => {
  const magnitude = Math.min(1, Math.abs(delta) / span);
  if (magnitude === 0) return null;

  const color = rampColor(magnitude);
  const base: CSSProperties = { background: color, boxShadow: `0 0 4px ${color}` };
  // Floored so the smallest real change still reads as a dot, not nothing.
  const reach = `max(var(--space-2xs), ${magnitude * 50}%)`;

  const style: CSSProperties = signed
    ? { ...base, ...(delta < 0 ? { right: '50%' } : { left: '50%' }), width: reach }
    : { ...base, left: '50%', width: `max(var(--space-2xs), ${magnitude * 100}%)`, transform: 'translateX(-50%)' };

  return <Box className="hid-cal__byte-change" style={style} aria-hidden />;
};

export { ByteChangeDot, rampColor };
