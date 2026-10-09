/* @layer bridge-wasm @kind types */
import type { Placement } from '@shared/randomizer/world/fill/placement.type';

type ActiveRun =
  | { kind: 'normal' }
  | { kind: 'seed'; placement: Placement }
  | { kind: 'online' };

export type { ActiveRun };
