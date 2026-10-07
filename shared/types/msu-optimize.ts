/* @layer shared-types @kind types */
/**
 * Normalising a pack to one audio format: what the measured preview promises, and what a
 * run reports back.
 *
 * EVERY audio file is a candidate, already-compressed ones included: an mp3 is decoded once and
 * stored exactly (lossless but bigger, shown as a negative saving). A file already in the target
 * format is not a candidate. Only a probe that cannot read a file takes it OUT of the list
 * (`excludedBecause`).
 *
 * The estimate is MEASURED, never a flat ratio: FLAC on 16-bit stereo lands anywhere from 40%
 * to 70% depending on the material. A short slice is really encoded and the ratio scaled up.
 */

/** The one format a pack is normalised to. Lossless, so no candidate loses a generation. */
const OPTIMIZE_TARGET_EXTENSION = 'flac';

/** Seconds of audio really encoded to measure one file's ratio. */
const OPTIMIZE_SLICE_SECONDS = 20;

/** Why a file is out of the run. Only ever a file no probe could read (a custom wrapper, a corrupt file). */
type OptimizeExclusion = 'unreadable';

interface OptimizeCandidate {
  name: string;
  currentBytes: number;
  /**
   * Measured cost of the target format for this file, or null when nothing could be measured
   * (excluded, or unknown duration). BIGGER than `currentBytes` is normal for a compressed source.
   */
  estimatedBytes: number | null;
  excludedBecause: OptimizeExclusion | null;
  /**
   * The repeat point to move into the manifest before this file's format changes, or null. It
   * lives in the MSU-1 header and dies with the container, so a run writes it into the layer's
   * `loopSample` FIRST; an intro-then-loop track that loses it silently repeats from zero.
   */
  carryLoopSample: number | null;
}

interface OptimizeAnalysis {
  pack: string;
  /** Every audio file not yet held in the target format, in pack order. An original already converted by a previous run is not one. */
  candidates: OptimizeCandidate[];
  /** Files already held in the target format (the file itself, or a converted copy beside it), so the preview can say the pack is part-way there. */
  alreadyTargetCount: number;
}

/** Which half of the operation a progress report belongs to. */
type OptimizePhase = 'measure' | 'convert';

interface OptimizeProgress {
  pack: string;
  phase: OptimizePhase;
  /** 1-based position of the file being worked on. */
  index: number;
  total: number;
  fileName: string;
}

/** One file that really was converted, with the size it really came out at. */
interface OptimizeConversion {
  name: string;
  /** The new file. Same stem in the target format, suffixed if that name was taken. */
  outputName: string;
  bytes: number;
}

interface OptimizeRunResult {
  converted: OptimizeConversion[];
  failed: Array<{ name: string; reason: string }>;
  /** Repeat points written into the manifest before the first encode ran. */
  loopPointsCarried: number;
}

export { OPTIMIZE_SLICE_SECONDS, OPTIMIZE_TARGET_EXTENSION };
export type {
  OptimizeAnalysis, OptimizeCandidate, OptimizeConversion, OptimizeExclusion, OptimizePhase,
  OptimizeProgress, OptimizeRunResult,
};
