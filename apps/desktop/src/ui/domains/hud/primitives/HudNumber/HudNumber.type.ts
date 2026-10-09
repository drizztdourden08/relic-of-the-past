/* @layer renderer-hud @kind types */
interface HudNumberProps {
  value: number;
  digits?: number;
  isMax?: boolean;
  scale: number;
  spritesBase: string;
}

export type { HudNumberProps };
