/* @layer renderer-hud @kind types */
type HudCountdownVariant = 'pixel' | 'smooth';

interface HudCountdownProps {
  variant: HudCountdownVariant;
  total: number;
  remaining: number;
  fractionLeft: number;
  scale: number;
  spritesBase: string;
}

interface SliceLayout {
  sliceCount: number;
  slicesLeft: number;
}

interface CountdownBox {
  size: number;
  rim: number;
}

export type { CountdownBox, HudCountdownProps, HudCountdownVariant, SliceLayout };
