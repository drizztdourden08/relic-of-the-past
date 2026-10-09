/* @layer electron-main @kind logic */
import { getUserDataPath } from '../../lib/paths';

const ffmpegToolDir = (): string => getUserDataPath('tools', 'ffmpeg');

export { ffmpegToolDir };
