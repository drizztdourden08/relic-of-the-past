/* @layer renderer-hud @kind types */

interface PauseHeroLayerProps {
  /** True while the menu is open; the idle clock runs only then. */
  active: boolean;
  /** Display scale: 1 SNES pixel = `scale` CSS pixels. */
  scale: number;
  /**
   * The EXACT INVERSE of the menu's slide, and the same transition. The layer
   * lives inside the sliding chrome (there is only one tree), but the
   * character does not belong to the chrome: they are standing in the world,
   * which does not slide. Cancelling the transform here keeps them on the spot
   * the core says they occupy for every frame of the animation, instead of
   * dropping in from above it.
   */
  counterTransform: string;
  transition: string;
}

export type { PauseHeroLayerProps };
