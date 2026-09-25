/* @layer renderer-hud @kind types */

interface PauseTextProps {
  /** Already folded to drawable characters by the caller (see the view's wrapName). */
  text: string;
  /** Display scale: 1 SNES pixel = `scale` CSS pixels. */
  scale: number;
  /** Edge length of one character in SNES pixels (default 8, the native tile). */
  size?: number;
  /** Fade the whole line for an unowned, unreachable or inactive label. */
  dim?: boolean;
  spritesBase: string;
}

export type { PauseTextProps };
