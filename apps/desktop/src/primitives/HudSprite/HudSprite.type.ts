/* @layer renderer-hud @kind types */
type SilhouetteTone = 'dark' | 'light';

interface HudSpriteProps {
  src: string;
  width: number;
  height: number;
  outline?: boolean;
  silhouette?: boolean;
  silhouetteTone?: SilhouetteTone;
  scale: number;
}

export type { HudSpriteProps, SilhouetteTone };
