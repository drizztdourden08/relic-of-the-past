/* @layer renderer-hud @kind types */
interface HudPixelPieProps {
  sliceCount: number;
  slicesLeft: number;
  scale: number;
}

interface PieFrame {
  gridSize: number;
  sliceCount: number;
  slicesLeft: number;
  leavingStep: number;
  pulseStep: number;
}

interface SliceMap {
  gridSize: number;
  sliceCount: number;
  owner: Int8Array;
  outline: Uint8Array;
  backing: Uint8Array;
  rim: Uint8Array;
  hub: Uint8Array;
}

interface SliceGeometry {
  count: number;
  step: number;
  discRadius: number;
  sliceRadius: number;
}

interface SliceCell {
  cell: number;
  px: number;
  py: number;
}

type PiePalette = readonly string[];

interface StepClock {
  left: number;
  from: number;
  ticks: number;
}

export type { HudPixelPieProps, PieFrame, PiePalette, SliceCell, SliceGeometry, SliceMap, StepClock };
