/* @layer renderer-hud @kind types */
type HeartMode = 'original' | 'smooth';

interface HudHeartProps {
  fill: number;
  mode: HeartMode;
  armor?: number;
  scale: number;
}

interface HeartTint {
  rim: string;
  highlight: string;
  shade: string;
}

export type { HeartMode, HeartTint, HudHeartProps };
