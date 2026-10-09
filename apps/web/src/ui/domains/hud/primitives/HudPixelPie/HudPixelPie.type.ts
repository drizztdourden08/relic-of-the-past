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

type PiePalette = readonly string[];

interface StepClock {
  left: number;
  from: number;
  ticks: number;
}

export type { HudPixelPieProps, PieFrame, PiePalette, SliceMap, StepClock };
