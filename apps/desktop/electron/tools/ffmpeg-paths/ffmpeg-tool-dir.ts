/* @layer electron-main @kind logic */
import { getUserDataPath } from '@drizztdourden08/brock-electron/main';

const ffmpegToolDir = (): string => getUserDataPath('tools', 'ffmpeg');

export { ffmpegToolDir };
