/* @layer renderer-hud @kind types */
type MagicMeterMode = 'original' | 'accurate';

interface HudMagicMeterProps {
  value: number;
  halfMagic: boolean;
  mode: MagicMeterMode;
  scale: number;
  spritesBase: string;
}

interface MagicOriginalProps {
  tile: number;
  spritesBase: string;
  fillLevel: number;
}

interface MagicAccurateProps {
  tile: number;
  scale: number;
  spritesBase: string;
  value: number;
}

interface MagicCapRowProps {
  edge: 'top' | 'bottom';
  tile: number;
  spritesBase: string;
}

export type { HudMagicMeterProps, MagicAccurateProps, MagicCapRowProps, MagicOriginalProps };
