/* @layer bridge-wasm @kind types */
interface LiveSpriteInfo {
  slot: number;
  type: number;
  state: number;
  subtype: number;
  subtype2: number;
  e: number;
  x: number;
  y: number;
}

type Point = { x: number; y: number };

export type { LiveSpriteInfo, Point };
