/* @layer bridge-wasm @kind types */
interface GlyphAtlas {
  canvas: HTMLCanvasElement;
  widths: Uint8Array;
  key: string;
}

interface TileSpot {
  tiles: Uint8Array;
  tile: number;
  x: number;
  y: number;
  ramp: string[];
}

export type { GlyphAtlas, TileSpot };
