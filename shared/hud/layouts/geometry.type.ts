/* @layer shared-hud @kind types */
/**
 * The two rectangles the layout math passes around. SNES pixels throughout.
 * The renderer multiplies by its own display scale, this layer never does.
 */

interface Size { w: number; h: number }

interface Rect { x: number; y: number; w: number; h: number }

export type { Rect, Size };
