/* @layer bridge-wasm @kind types */
import type { Placement } from '@rotp/randomizer';

type CurrentRun =
  | { kind: 'normal' }
  | { kind: 'seed'; placement: Placement }
  | { kind: 'online' };

export type { CurrentRun };
