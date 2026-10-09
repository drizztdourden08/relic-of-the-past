/* @layer electron-main @kind logic */
import { spawn } from 'child_process';
import { PROBE_TIMEOUT_MS } from './ffmpeg-run.constants';
import type { ToolResult } from './ffmpeg-run.type';

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

export { runTool };
