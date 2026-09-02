/* @layer shared-types @kind types */
/**
 * Normalising a pack to one audio format: what the measured preview promises, and what a
 * run reports back.
 *
 * EVERY audio file the pack holds is a candidate, an already-compressed one included. The
 * point is a pack in one format, so an mp3 is decoded once and stored exactly — lossless,
 * but bigger, and the preview says so with a negative saving rather than hiding it in the
 * total. A file already in the target format is not a candidate: there is nothing to
 * normalise about it. The only thing that takes a file OUT of the list is a probe that
 * cannot read it at all, which is what `excludedBecause` records.
 *
 * The estimate is MEASURED, never a flat ratio: FLAC on 16-bit stereo lands anywhere from
 * 40% to 70% depending on the material, so a fixed percentage would be a guess dressed up
 * as a number. A short slice is really encoded and the real ratio is scaled up.
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
   * What the target format is measured to cost for this file, or null when nothing could be
   * measured (excluded, or a source whose duration is unknown so the slice cannot be scaled).
   * BIGGER than `currentBytes` is a normal answer for an already-compressed source.
   */
  estimatedBytes: number | null;
  excludedBecause: OptimizeExclusion | null;
  /**
   * The repeat point that has to move into the manifest before this file's format changes,
   * or null when there is none to move. It lives in the MSU-1 header and dies with the
   * container, so a run writes it into the layer's `loopSample` FIRST — an intro-then-loop
   * track whose point is lost silently starts repeating from zero.
   */
  carryLoopSample: number | null;
}

interface OptimizeAnalysis {
  pack: string;
  /**
   * Every audio file the pack does not yet hold in the target format, in the order the pack
   * lists them. An original a previous run already converted is not one: its copy exists.
   */
  candidates: OptimizeCandidate[];
  /**
   * Files whose audio the pack already holds in the target format — the file itself, or a
   * converted copy beside it. Counted so the preview can say the pack is part-way there.
   */
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
