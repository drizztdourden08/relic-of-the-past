/* @layer renderer-hud @kind types */
interface HudPieProps {
  sliceCount: number;
  slicesLeft: number;
  size: number;
}

type SliceState = 'idle' | 'next' | 'gone';

interface SliceShape {
  path: string;
  pushX: number;
  pushY: number;
}

export type { HudPieProps, SliceShape, SliceState };
