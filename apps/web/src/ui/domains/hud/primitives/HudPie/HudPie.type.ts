/* @layer renderer-hud @kind types */
interface HudPieProps {
  /** Equal slices the pie is cut into. */
  sliceCount: number;
  /** Slices still in place. They leave clockwise from twelve o'clock, so the rest sit after the gap. */
  slicesLeft: number;
  /** Rendered width and height in CSS pixels. */
  size: number;
}

/** Where a slice stands: in place, next to leave, or already out. */
type SliceState = 'idle' | 'next' | 'gone';

/** One slice, ready to draw. */
interface SliceShape {
  /** SVG path data of the wedge. */
  path: string;
  /** Offset the slice slides to as it leaves, in viewBox units. */
  pushX: number;
  pushY: number;
}

export type { HudPieProps, SliceShape, SliceState };
