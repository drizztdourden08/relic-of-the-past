/* @layer electron-main @kind logic */
import type { ToolDef } from '@drizztdourden08/brock-tools/main';
import { FFMPEG_TOOL_ID } from '@app/ffmpeg-tool';
import { resolveFfmpegDownload } from './ffmpeg-release';
import { FFMPEG_LINUX_HINT, FFMPEG_OTHER_HINT, FFMPEG_VERSION } from './ffmpeg-tool.constants';

const ffmpegTool = (os: NodeJS.Platform): ToolDef => ({
  id: FFMPEG_TOOL_ID,
  label: 'FFmpeg',
  binaries: ['ffmpeg', 'ffprobe'],
  version: FFMPEG_VERSION,
  ...(os === 'win32' ? { resolveDownload: resolveFfmpegDownload } : {}),
  installHint: os === 'linux' ? FFMPEG_LINUX_HINT : FFMPEG_OTHER_HINT,
});

export { ffmpegTool };
