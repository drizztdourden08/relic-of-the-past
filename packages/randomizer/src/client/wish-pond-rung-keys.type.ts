/* @layer bridge-wasm @kind types */
import type { PondInstance } from '../world/pond/pond-instance.type';

interface WishPondWater {
  instance: PondInstance;
  pond: number;
}

interface WishPondRungKey {
  pond: number;
  rung: number;
}

export type { WishPondRungKey, WishPondWater };
