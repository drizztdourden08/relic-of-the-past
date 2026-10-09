/* @layer bridge-wasm @kind types */
import type { CheckId } from '@rotp/game-data';

interface SpriteContext {
  roomId: number;
  completed: ReadonlySet<CheckId>;
  shutterCount: number;
}

export type { SpriteContext };
