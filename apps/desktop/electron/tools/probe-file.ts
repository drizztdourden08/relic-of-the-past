/* @layer electron-main @kind logic */
import type { ToolsMain } from '@drizztdourden08/brock-tools/main';
import type { ProbedAudio } from '@rotp/msu';
import { FFMPEG_TOOL_ID } from '@app/ffmpeg-tool';
import { parseProbeJson } from './ffprobe-parse';
import { PROBE_ARGS, PROBE_TIMEOUT_MS } from './ffmpeg-tool.constants';
import { cachedProbe, rememberProbe } from './probe-cache';

const probeFile = async (tools: ToolsMain, filePath: string): Promise<ProbedAudio | null> => {
  const remembered = await cachedProbe(filePath);
  if (remembered) return remembered;
  try {
    const result = await tools.run(FFMPEG_TOOL_ID, 'ffprobe', [...PROBE_ARGS, filePath], { timeoutMs: PROBE_TIMEOUT_MS });
    const probed = result.code === 0 ? parseProbeJson(result.stdout) : null;
    if (probed) await rememberProbe(filePath, probed);
    return probed;
  } catch {
    return null;
  }
};

export { probeFile };
