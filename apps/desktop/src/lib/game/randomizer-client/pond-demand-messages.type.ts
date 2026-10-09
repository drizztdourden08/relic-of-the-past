/* @layer bridge-wasm @kind types */
interface PondDemandLineIndex {
  ask: number;
  refuse: number;
  award: number;
}

type PlanPondDemandLines = ReadonlyMap<string, PondDemandLineIndex>;

export type { PlanPondDemandLines, PondDemandLineIndex };
