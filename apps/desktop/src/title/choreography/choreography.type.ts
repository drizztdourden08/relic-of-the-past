/* @layer renderer-hud @kind types */
import type { TitleFrame } from '@rotp/game-data';
import type { Scene, SceneClock } from '../scene/scene.type';

interface Picture {
  img: HTMLImageElement;
  scale: number;
}

interface TitlePictures {
  logo: Picture;
  sword: Picture;
  openingMark: HTMLImageElement;
}

interface PixelSet {
  xs: Int16Array;
  ys: Int16Array;
}

interface ShinePixels {
  logo: PixelSet;
  sword: PixelSet;
}

interface Sparkle {
  x: number;
  y: number;
  start: number;
  step: number;
  end: number;
}

interface FrameOrigin {
  x: number;
  y: number;
}

interface ShineDrawInput {
  ctx: CanvasRenderingContext2D;
  t: number;
  alpha: number;
  at: FrameOrigin;
  swordPlanted: boolean;
}

interface Shine {
  draw: (input: ShineDrawInput) => void;
}

interface SweepDrawInput {
  ctx: CanvasRenderingContext2D;
  t: number;
  logo: Picture;
  alpha: number;
  at: FrameOrigin;
}

interface LogoSweep {
  draw: (input: SweepDrawInput) => void;
}

interface TriforcePicture {
  canvas: HTMLCanvasElement;
  update: (block: Uint8Array, palette: number[]) => void;
}

interface TitleFrameInput {
  frame: TitleFrame;
  clock: SceneClock;
  scene: Scene;
  sceneCanvas: HTMLCanvasElement;
  pictures: TitlePictures;
  triforce: TriforcePicture;
  poly: Uint8Array | null;
  palette: number[] | null;
  dimFlashes: boolean;
  coreTitleHidden: boolean;
  shine: Shine;
  sweep: LogoSweep;
}

interface BandSpec {
  x: number;
  w: number;
  h: number;
  alpha: number;
}

interface TriforceTileInput {
  px: Uint8ClampedArray;
  block: Uint8Array;
  rgb: readonly (readonly [number, number, number])[];
  tx: number;
  ty: number;
}

export type {
  BandSpec, FrameOrigin, LogoSweep, Picture, PixelSet, Shine, ShineDrawInput, ShinePixels, Sparkle, SweepDrawInput, TitleFrameInput,
  TitlePictures, TriforcePicture, TriforceTileInput,
};
