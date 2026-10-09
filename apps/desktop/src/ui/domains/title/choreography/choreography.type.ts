/* @layer renderer-hud @kind types */
import type { TitleFrame } from '@shared/game/title/title-frame.type';
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

interface Shine {
  draw: (ctx: CanvasRenderingContext2D, t: number, alpha: number, frameX: number, frameY: number, swordPlanted: boolean) => void;
}

interface LogoSweep {
  draw: (ctx: CanvasRenderingContext2D, t: number, logo: Picture, alpha: number, frameX: number, frameY: number) => void;
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

export type { LogoSweep, Picture, PixelSet, Shine, ShinePixels, Sparkle, TitleFrameInput, TitlePictures, TriforcePicture };
