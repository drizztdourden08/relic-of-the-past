/* @layer bridge-wasm @kind types */
import type { CrossingTarget } from '@shared/game/navigation';

interface ResolvedTarget {
  target: CrossingTarget;
  label: string;
}

export type { ResolvedTarget };
