/* @layer electron-main @kind logic */
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import type { OptimizeAnalysis } from '@rotp/msu';
import { packFilePath } from '../pack-fs';
import { measureCandidate } from './measure';
import { listPackAudio, pendingConversions } from './pack-audio';
import type { AnalyzeRequest, ProgressReporter } from './analyze.type';

const analyzePack = async (request: AnalyzeRequest): Promise<OptimizeAnalysis> => {
  const { pack, tools, report } = request;
  const audio = await listPackAudio(pack);
  const pending = pendingConversions(audio);
  const tempDir = await mkdtemp(join(tmpdir(), 'msu-optimize-'));
  try {
    const candidates = [];
    for (const [index, file] of pending.entries()) {
      report({ pack, phase: 'measure', index: index + 1, total: pending.length, fileName: file.name });
      candidates.push(await measureCandidate({
        tools,
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
