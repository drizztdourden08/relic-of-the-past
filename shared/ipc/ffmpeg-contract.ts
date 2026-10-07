/* @layer shared-types @kind types */
/**
 * The optional-ffmpeg invoke channels: query its state, install it on request, and probe
 * one media file with it. Split out of invoke-contract.ts's single `InvokeContract`
 * (which extends this) to keep that file under the line cap, but these signatures still
 * have their one source of truth here.
 *
 * Install progress arrives on the `ffmpeg:progress` EVENT (see event-contract.ts), which
 * carries the same `FfmpegState` these channels return, so the renderer reads one shape.
 */
import type { ProbedAudio } from '@shared/types/audio-probe';
import type { FfmpegState } from '@shared/types/ffmpeg-tool';

interface FfmpegInvokeContract {
  'ffmpeg:getState': () => Promise<FfmpegState>;
  /** Downloads, verifies and extracts. Resolves with the final state; never throws. */
  'ffmpeg:install': () => Promise<FfmpegState>;
  /** POSIX path relative to the Data root. null when the tool is absent or the probe failed. */
  'ffmpeg:probeAudio': (dataPath: string) => Promise<ProbedAudio | null>;
}

export type { FfmpegInvokeContract };
