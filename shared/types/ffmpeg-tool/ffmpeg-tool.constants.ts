/* @layer shared-types @kind constants */
import type { FfmpegRelease } from './ffmpeg-tool.type';

const PINNED_FFMPEG: FfmpegRelease = {
  tag: 'latest',
  asset: 'ffmpeg-n9.0-latest-win64-lgpl-9.0.zip',
};

const FFMPEG_RELEASES_BASE = 'https://github.com/BtbN/FFmpeg-Builds/releases/download';

const FFMPEG_LINUX_PACKAGE = 'ffmpeg';

export { FFMPEG_LINUX_PACKAGE, FFMPEG_RELEASES_BASE, PINNED_FFMPEG };
