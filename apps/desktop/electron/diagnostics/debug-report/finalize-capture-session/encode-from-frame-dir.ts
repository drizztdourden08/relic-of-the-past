/* @layer electron-main @kind logic */
import { join } from 'path';
import { runTool, ENCODE_TIMEOUT_MS } from '../../../tools/ffmpeg-run';
import { VIDEO_FPS } from './finalize-capture-session.constants';

const encodeFromFrameDir = async (ffmpegPath: string, frameDir: string, outPath: string): Promise<boolean> => {
  const args = [
    '-y', '-framerate', VIDEO_FPS, '-i', join(frameDir, 'frame_%04d.png'),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '23', outPath,
  ];
  const result = await runTool(ffmpegPath, args, ENCODE_TIMEOUT_MS);
  return result.code === 0;
};

export { encodeFromFrameDir };
