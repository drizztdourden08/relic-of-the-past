/* @layer bridge-wasm @kind types */
import type { CrossingTarget } from '@rotp/game-core';

interface ResolvedTarget {
  target: CrossingTarget;
  label: string;
}

export type { ResolvedTarget };
