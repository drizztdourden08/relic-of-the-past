/* @layer bridge-wasm @kind types */
import type { CheckId } from '@shared/game/data';

interface SpriteContext {
  roomId: number;
  completed: ReadonlySet<CheckId>;
  shutterCount: number;
}

export type { SpriteContext };
