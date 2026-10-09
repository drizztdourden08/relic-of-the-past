/* @layer electron-main @kind logic */
import type { ToolsMain } from '@drizztdourden08/brock-tools/main';
import { FFMPEG_TOOL_ID } from '@shared/types/ffmpeg-tool';
import { encodeArgs } from './encode-args';
import { encodeProgress } from './encode-progress';
import type { EncodeRequest } from './flac-encode.type';

const progressListener = (request: EncodeRequest) => {
  const { durationSeconds, onProgress } = request;
  if (!onProgress || !durationSeconds || durationSeconds <= 0) return undefined;
  return encodeProgress(durationSeconds, onProgress);
};

const encodeToTarget = async (tools: ToolsMain, request: EncodeRequest): Promise<void> => {
  const result = await tools.run(FFMPEG_TOOL_ID, 'ffmpeg', encodeArgs(request), { onLine: progressListener(request) });
  if (result.code === 0) return;
  throw new Error(result.stderr.trim().split('\n').pop() ?? `encoder exited with ${result.code}`);
};

export { encodeToTarget };
export type { EncodeRequest };
