/* @layer renderer-app @kind types */
interface HitRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface MovementHitRects {
  area: HitRect | null;
  handle: HitRect | null;
  round: boolean;
}

export type { HitRect, MovementHitRects };
