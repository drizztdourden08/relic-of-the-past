/* @layer electron-main @kind logic */
import type { ProbedAudio } from '@shared/types/audio-probe';
import { locateFfmpeg } from '../ffmpeg-locate';
import { parseProbeJson } from '../ffprobe-parse';
import { cachedProbe, rememberProbe } from '../probe-cache';
import { PROBE_ARGS } from './ffmpeg-run.constants';
import { runTool } from './run-tool';

const probeFile = async (filePath: string): Promise<ProbedAudio | null> => {
  const remembered = await cachedProbe(filePath);
  if (remembered) return remembered;
  const found = await locateFfmpeg();
  if (!found) return null;
  try {
    const result = await runTool(found.ffprobePath, [...PROBE_ARGS, filePath]);
    const probed = result.code === 0 ? parseProbeJson(result.stdout) : null;
    if (probed) await rememberProbe(filePath, probed);
    return probed;
  } catch {
    return null;
  }
};

export { probeFile };
