/* @layer electron-main @kind logic */
/**
 * Invoke the optional ffmpeg tool.
 *
 * Arguments are always passed as an array — never a shell string. Both the tool path and
 * the media paths contain spaces on a normal Windows install, and a shell would also make
 * every filename a potential injection site.
 */
import { spawn } from 'child_process';
import type { ProbedAudio } from '@shared/types/audio-probe';
import { locateFfmpeg } from './ffmpeg-locate';
import { parseProbeJson } from './ffprobe-parse';
import { cachedProbe, rememberProbe } from './probe-cache';

interface ToolResult {
  code: number | null;
  stdout: string;
  stderr: string;
}

/**
 * Long enough for a probe of a large file on a cold disk, short enough to not hang the UI. This is
 * the default because reading metadata is the common call and it should never take seconds.
 */
const PROBE_TIMEOUT_MS = 30_000;

/**
 * Encoding is a different order of work: a long track at a real compression level can run for
 * minutes, and killing it mid-write leaves a truncated output. The probe timeout applied to an
 * encode silently turned long files into failures, so a caller doing real work passes its own.
 */
const ENCODE_TIMEOUT_MS = 10 * 60_000;

const runTool = (
  exePath: string, args: string[], timeoutMs: number = PROBE_TIMEOUT_MS,
): Promise<ToolResult> =>
  new Promise((resolve, reject) => {
    const child = spawn(exePath, args, { windowsHide: true, timeout: timeoutMs });
    let stdout = '';
    let stderr = '';
    child.stdout?.on('data', (chunk: Buffer) => { stdout += chunk.toString('utf8'); });
    child.stderr?.on('data', (chunk: Buffer) => { stderr += chunk.toString('utf8'); });
    child.on('error', reject);
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });

const PROBE_ARGS = ['-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams'];

/**
 * What ffprobe can say about one media file, or null when the tool is not installed, the
 * file is not media, or the probe failed. Null is a normal answer, not an error: the
 * caller keeps its existing (unknown) values.
 */
const probeFile = async (filePath: string): Promise<ProbedAudio | null> => {
  // Asked once per file, not once per look — see probe-cache for why the key is what it is.
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

export { probeFile, runTool, ENCODE_TIMEOUT_MS, PROBE_TIMEOUT_MS };
export type { ToolResult };
