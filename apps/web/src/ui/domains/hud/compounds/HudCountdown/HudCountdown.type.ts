/* @layer renderer-hud @kind types */
/** How the pie is drawn: hard pixels on the game's grid, or smooth vector slices. */
type HudCountdownVariant = 'pixel' | 'smooth';

interface HudCountdownProps {
  variant: HudCountdownVariant;
  /** Seconds the countdown started from. */
  total: number;
  /** Whole seconds left, the number drawn on the pie. */
  remaining: number;
  /** Share of the whole countdown still to run, 1 down to 0, moving every frame. */
  fractionLeft: number;
  /** CSS pixels per game pixel. */
  scale: number;
  spritesBase: string;
}

/** How the pie is cut and how much of it is left. */
interface SliceLayout {
  sliceCount: number;
  slicesLeft: number;
}

/** The pie box as rendered, in CSS pixels. */
interface CountdownBox {
  size: number;
  /** Empty space between the box edge and the disc. */
  rim: number;
}

export type { CountdownBox, HudCountdownProps, HudCountdownVariant, SliceLayout };
