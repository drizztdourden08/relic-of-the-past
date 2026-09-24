/* @layer renderer-hud @kind types */
/** The pieces the title scene is built from, where they go, and the clock they move to. */

interface SceneAssets {
  sky: HTMLImageElement;
  mountains: readonly HTMLImageElement[];
  trees: readonly HTMLImageElement[];
  clouds: readonly HTMLImageElement[];
  landmark: HTMLImageElement;
}

/** The canvas in game pixels, with the 256x224 frame's place inside it. */
interface SceneGeometry {
  width: number;
  height: number;
  frameX: number;
  frameY: number;
  /** The first of the two water-line rows. */
  horizonY: number;
}

interface Placed {
  x: number;
  y: number;
  variant: number;
  flip: boolean;
}

interface Drifting extends Placed {
  /** Game pixels per second of its own motion, on top of the parallax. */
  speed: number;
}

interface SceneLayout {
  mountains: readonly Placed[];
  trees: readonly Placed[];
  clouds: readonly Drifting[];
  /** Sparse patches of moving water in the lower water rows. */
}

interface SceneClock {
  /** Seconds since the scene was built. */
  t: number;
  /** Parallax travel in game pixels; zero while still. */
  drift: number;
  /** Whether the water wobbles and the clouds move. */
  moving: boolean;
}

interface SceneLayer {
  draw: (ctx: CanvasRenderingContext2D, clock: SceneClock) => void;
}

export type { Drifting, Placed, SceneAssets, SceneClock, SceneGeometry, SceneLayer, SceneLayout };
