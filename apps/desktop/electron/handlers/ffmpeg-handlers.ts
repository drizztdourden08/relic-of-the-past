/* @layer electron-main @kind logic */
import type { HandlerGroup } from '@drizztdourden08/brock-electron/main';
import { registerFfmpegHandlers } from '../tools/ipc-handlers';

const ffmpegHandlers: HandlerGroup = {
  id: 'ffmpeg',
  register: () => {
    registerFfmpegHandlers();
  },
};

export { ffmpegHandlers };
