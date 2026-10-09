/* @layer renderer-components @kind types */
type Scope = Readonly<Record<string, number>>;

interface CaseMatches {
  wins: readonly number[];
  otherwise: number;
  total: number;
}

export type { CaseMatches, Scope };
