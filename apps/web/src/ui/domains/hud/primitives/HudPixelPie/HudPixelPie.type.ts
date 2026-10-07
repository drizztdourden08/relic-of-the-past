/* @layer renderer-hud @kind types */
interface HudPixelPieProps {
  /** Equal slices the pie is cut into. */
  sliceCount: number;
  /** Slices still in place. They leave clockwise from twelve o'clock. */
  slicesLeft: number;
  /** CSS pixels per game pixel. */
  scale: number;
}

/** What the rasteriser needs to draw one frame of the pie. */
interface PieFrame {
  /** Side of the square grid in game pixels. */
  gridSize: number;
  sliceCount: number;
  slicesLeft: number;
  /** 0 when no slice is leaving, else 1 up to EXIT_STEPS for the slice that just went. */
  leavingStep: number;
  /** Index into the pulse levels for the next slice to leave. */
  pulseStep: number;
}

/** Which slice owns each grid cell, row by row. */
interface SliceMap {
  gridSize: number;
  sliceCount: number;
  /** Slice index per cell, or -1 where no slice is drawn. */
  owner: Int8Array;
  /** Cells inside the disc outline ring. */
  outline: Uint8Array;
  /** Cells on the disc inside the outline: gaps, hub and the ring under the slices. */
  backing: Uint8Array;
  /** Slice cells that take the shaded colour step. */
  rim: Uint8Array;
  /** Slice cells inside the hub, under the digits. */
  hub: Uint8Array;
}

/** CSS colours by palette index. Index 0 is never painted. */
type PiePalette = readonly string[];

export type { HudPixelPieProps, PieFrame, PiePalette, SliceMap };
