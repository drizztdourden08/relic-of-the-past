/* @layer renderer-hud @kind types */
interface SceneAssets {
  sky: HTMLImageElement;
  mountains: readonly HTMLImageElement[];
  trees: readonly HTMLImageElement[];
  clouds: readonly HTMLImageElement[];
  landmark: HTMLImageElement;
}

interface SceneFiles {
  sky: string;
  mountains: string[];
  trees: string[];
  clouds: string[];
  landmark: string;
}

interface SceneGeometry {
  width: number;
  height: number;
  frameX: number;
  frameY: number;
  horizonY: number;
}

interface Placed {
  x: number;
  y: number;
  variant: number;
  flip: boolean;
}

interface Drifting extends Placed {
  speed: number;
}

interface SceneLayout {
  mountains: readonly Placed[];
  trees: readonly Placed[];
  clouds: readonly Drifting[];
}

interface SceneClock {
  t: number;
  drift: number;
  moving: boolean;
}

interface SceneLayer {
  draw: (ctx: CanvasRenderingContext2D, clock: SceneClock) => void;
}

interface Scene {
  geometry: SceneGeometry;
  draw: (ctx: CanvasRenderingContext2D, clock: SceneClock) => void;
}

interface RidgeOptions {
  pieces: readonly HTMLImageElement[];
  placed: readonly Placed[];
  parallax: number;
  rows?: number;
}

interface Ripple {
  x: number;
  y: number;
  w: number;
  light: boolean;
  speed: number;
  phase: number;
}

interface SeededRandom {
  next: () => number;
  int: (lo: number, hi: number) => number;
  range: (lo: number, hi: number) => number;
  chance: (p: number) => boolean;
}

export type {
  Drifting, Placed, RidgeOptions, Ripple, Scene, SceneAssets, SceneClock, SceneFiles, SceneGeometry, SceneLayer, SceneLayout, SeededRandom,
};
