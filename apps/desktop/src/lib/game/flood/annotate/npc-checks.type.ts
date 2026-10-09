/* @layer bridge-wasm @kind types */
import type { CheckId } from '@shared/game/data';

interface NpcCheck {
  checkId: CheckId;
  name: string;
  done: boolean;
}

export type { NpcCheck };
