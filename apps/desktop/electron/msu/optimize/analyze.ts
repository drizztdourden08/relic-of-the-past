/* @layer electron-main @kind logic */
/**
 * The measured preview: every file the pack would convert, and what each would really cost.
 *
 * EVERY audio file not already in the target format is measured, an mp3 or an ogg included.
 * A pack in one format is the point, and FLAC is lossless, so an already-compressed source is
 * decoded once and stored exactly — but it WILL grow, and its row says so with an estimate
 * larger than its current size rather than being quietly left out.
 *
 * Each measurement really encodes a short slice, so this costs one encoder run per file. The
 * progress report is what makes that visible instead of looking like a hang.
 */
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import type { OptimizeAnalysis, OptimizeProgress } from '@shared/types/msu-optimize';
import { packFilePath } from '../pack-fs';
import { measureCandidate } from './measure';
import { listPackAudio, pendingConversions } from './pack-audio';

type ProgressReporter = (progress: OptimizeProgress) => void;

interface AnalyzeRequest {
  pack: string;
  ffmpegPath: string;
  report: ProgressReporter;
}

const analyzePack = async (request: AnalyzeRequest): Promise<OptimizeAnalysis> => {
  const { pack, ffmpegPath, report } = request;
  const audio = await listPackAudio(pack);
  // Not "everything outside the target format": an original a previous run already converted
  // sits beside its copy until it is thrown out, and measuring it would promise a second encode.
  const pending = pendingConversions(audio);
  // One scratch directory for the whole pass, removed whatever happens — a slice is a
  // throwaway measurement and must never be left behind in temp.
  const tempDir = await mkdtemp(join(tmpdir(), 'msu-optimize-'));
  try {
    const candidates = [];
    for (const [index, file] of pending.entries()) {
      report({ pack, phase: 'measure', index: index + 1, total: pending.length, fileName: file.name });
      candidates.push(await measureCandidate({
        ffmpegPath,
        tempDir,
        filePath: packFilePath(pack, file.name),
        fileName: file.name,
        sizeBytes: file.sizeBytes,
        index,
      }));
    }
    return { pack, candidates, alreadyTargetCount: audio.length - pending.length };
  } finally {
    await rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
};

export { analyzePack };
export type { AnalyzeRequest, ProgressReporter };
