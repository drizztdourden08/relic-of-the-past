/* @layer shared-game @kind logic */
/**
 * The shapes a drawn message-box frame is made of, as plain strings the renderer hands to SVG and
 * CSS: the outline path of a box with square, rounded or chamfered corners, the clip that gives the
 * ground the same corners, and where the four corner marks sit and which way they turn.
 */
import type { DialogCorner } from './box-style';

/** A closed box outline inset by |inset| from a |w| by |h| area, corners of |size|. */
const framePath = (w: number, h: number, inset: number, corner: DialogCorner, size: number): string => {
  const x0 = inset;
  const y0 = inset;
  const x1 = w - inset;
  const y1 = h - inset;
  const c = Math.max(0, Math.min(size, (x1 - x0) / 2, (y1 - y0) / 2));
  if (corner === 'square' || c === 0) return `M${x0} ${y0}H${x1}V${y1}H${x0}Z`;
  if (corner === 'chamfered') {
    return `M${x0 + c} ${y0}H${x1 - c}L${x1} ${y0 + c}V${y1 - c}L${x1 - c} ${y1}H${x0 + c}L${x0} ${y1 - c}V${y0 + c}Z`;
  }
  const arc = (x: number, y: number): string => `A${c} ${c} 0 0 1 ${x} ${y}`;
  return `M${x0 + c} ${y0}H${x1 - c}${arc(x1, y0 + c)}V${y1 - c}${arc(x1 - c, y1)}H${x0 + c}${arc(x0, y1 - c)}V${y0 + c}${arc(x0 + c, y0)}Z`;
};

/** The CSS shape of the ground under the frame: a clip polygon for a chamfer, a radius otherwise. */
const groundShape = (corner: DialogCorner, size: number): { borderRadius?: number; clipPath?: string } => {
  if (corner === 'rounded') return { borderRadius: size };
  if (corner === 'chamfered') {
    const s = `${size}px`;
    const far = `calc(100% - ${s})`;
    return { clipPath: `polygon(${s} 0, ${far} 0, 100% ${s}, 100% ${far}, ${far} 100%, ${s} 100%, 0 ${far}, 0 ${s})` };
  }
  return {};
};

interface CornerPlacement {
  x: number;
  y: number;
  /** Mirror factors: the top-left mark is drawn as is, the others are its reflections. */
  sx: 1 | -1;
  sy: 1 | -1;
}

/** The four corner marks, |pad| in from each corner of a |w| by |h| area. */
const cornerPlacements = (w: number, h: number, pad: number): CornerPlacement[] => [
  { x: pad, y: pad, sx: 1, sy: 1 },
  { x: w - pad, y: pad, sx: -1, sy: 1 },
  { x: pad, y: h - pad, sx: 1, sy: -1 },
  { x: w - pad, y: h - pad, sx: -1, sy: -1 },
];

/**
 * The corner size of an outline |inset| inside one whose corners are |size|, so the two run
 * parallel: a concentric arc loses the inset from its radius, and a chamfer cut moved inward by
 * |inset| shortens by inset times (2 minus root 2).
 */
const cornerAtInset = (corner: DialogCorner, size: number, inset: number): number => {
  if (corner === 'rounded') return Math.max(0, size - inset);
  if (corner === 'chamfered') return Math.max(0, size - inset * (2 - Math.SQRT2));
  return 0;
};

/** A triforce of height |s| centred on the origin, apex up: the outer triangle split into three. */
const triforcePath = (s: number): string => {
  const half = s / 2;
  const w = s / Math.sqrt(3);
  const top = `M0 ${-half}L${w / 2} 0L${-w / 2} 0Z`;
  const left = `M${-w / 2} 0L0 ${half}L${-w} ${half}Z`;
  const right = `M${w / 2} 0L${w} ${half}L0 ${half}Z`;
  return `${top}${left}${right}`;
};

export { framePath, groundShape, cornerPlacements, cornerAtInset, triforcePath };
export type { CornerPlacement };
