/* @layer shared-types @kind types */
type OptimizeExclusion = 'unreadable';

interface OptimizeCandidate {
  name: string;
  currentBytes: number;
  estimatedBytes: number | null;
  excludedBecause: OptimizeExclusion | null;
  carryLoopSample: number | null;
}

interface OptimizeAnalysis {
  pack: string;
  candidates: OptimizeCandidate[];
  alreadyTargetCount: number;
}

type OptimizePhase = 'measure' | 'convert';

interface OptimizeProgress {
  pack: string;
  phase: OptimizePhase;
  index: number;
  total: number;
  fileName: string;
  fileFraction?: number;
}

interface OptimizeConversion {
  name: string;
  outputName: string;
  bytes: number;
}

interface OptimizeRunResult {
  converted: OptimizeConversion[];
  failed: Array<{ name: string; reason: string }>;
  loopPointsCarried: number;
}

export type {
  OptimizeAnalysis,
  OptimizeCandidate,
  OptimizeConversion,
  OptimizeProgress,
  OptimizeRunResult,
};
