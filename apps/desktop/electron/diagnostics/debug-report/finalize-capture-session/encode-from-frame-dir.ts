/* @layer electron-main @kind logic */
import { join } from 'path';
import type { ToolsMain } from '@drizztdourden08/brock-tools/main';
import { FFMPEG_TOOL_ID } from '@shared/types/ffmpeg-tool';
import { VIDEO_FPS } from './finalize-capture-session.constants';

const encodeFromFrameDir = async (tools: ToolsMain, frameDir: string, outPath: string): Promise<boolean> => {
  const args = [
    '-y', '-framerate', VIDEO_FPS, '-i', join(frameDir, 'frame_%04d.png'),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '23', outPath,
  ];
  const result = await tools.run(FFMPEG_TOOL_ID, 'ffmpeg', args);
  return result.code === 0;
};

export { encodeFromFrameDir };
