/* @layer renderer-hud @kind types */

interface SceneBackdropProps {
  /** Where the water line sits, as a fraction of the box's height from the top. */
  horizon?: number;
  /** Whole-number pixel scale; omitted, the smallest that covers the box's height. */
  scale?: number;
  /** Picks the placement of the mountains, clouds and ripples; the same seed draws the same scene. */
  seed?: number;
  className?: string;
}

export type { SceneBackdropProps };
