/* @layer renderer-hud @kind types */
interface HudCountProps {
  icon: string;
  iconWidth?: number;
  value: number;
  digits?: number;
  isMax?: boolean;
  scale: number;
  spritesBase: string;
}

export type { HudCountProps };
