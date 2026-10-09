/* @layer electron-main @kind logic */
import { ENCODE_TIMEOUT_MS, runTool } from '../../tools/ffmpeg-run';
import { encodeArgs } from './encode-args';
import type { EncodeRequest } from './flac-encode.type';

const encodeToTarget = async (ffmpegPath: string, request: EncodeRequest): Promise<void> => {
  const result = await runTool(ffmpegPath, encodeArgs(request), ENCODE_TIMEOUT_MS);
  if (result.code === 0) return;
  throw new Error(result.stderr.trim().split('\n').pop() ?? `encoder exited with ${result.code}`);
};

export { encodeToTarget };
export type { EncodeRequest };
