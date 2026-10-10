/* @layer tooling-scripts @kind types */
type Verdict = 'missing' | 'leased' | 'holds-work' | 'spent' | 'ready';

type WorktreeRecordLike = {
  lease?: unknown;
  notes?: readonly unknown[];
  pr?: unknown;
};

type WorktreeStatusLike = {
  missing?: unknown;
  dirty?: unknown;
  ahead?: unknown;
  behind?: unknown;
  merged?: unknown;
};

type Assessment = {
  verdict: Verdict;
  claimable: boolean;
  deletable: boolean;
  staleLease: boolean;
  behind: number;
};

export declare const VERDICTS: {
  readonly MISSING: 'missing';
  readonly LEASED: 'leased';
  readonly HOLDS_WORK: 'holds-work';
  readonly SPENT: 'spent';
  readonly READY: 'ready';
};
export declare const hasHistory: (record: WorktreeRecordLike) => boolean;
export declare const verdictFor: (record: WorktreeRecordLike, status: WorktreeStatusLike, now?: number) => Verdict;
export declare const assess: (record: WorktreeRecordLike, status: WorktreeStatusLike, now?: number) => Assessment;
export declare const bestToClaim: <T extends { assessment: Assessment }>(assessments: readonly T[]) => T | null;
