/* @layer bridge-wasm @kind types */
import type { CheckId } from '@rotp/game-data';

interface NpcCheck {
  checkId: CheckId;
  name: string;
  done: boolean;
}

export type { NpcCheck };
