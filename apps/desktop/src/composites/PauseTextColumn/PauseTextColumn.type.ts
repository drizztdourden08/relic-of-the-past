/* @layer renderer-hud @kind types */
interface PauseTextColumnProps {
  lines: readonly string[];
  left: number;
  top: number;
  width: number;
  height?: number;
  scale: number;
  size?: number;
  dim?: boolean;
  spritesBase: string;
}

export type { PauseTextColumnProps };
