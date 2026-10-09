/* @layer electron-main @kind logic */
import { defineBootTask } from '@drizztdourden08/brock-electron/main';
import { getTools } from '@drizztdourden08/brock-tools/main';
import { ffmpegTool } from '../tools/ffmpeg-tool';

export default defineBootTask({
  label: 'Declaring the media tool',
  run: (ctx) => {
    getTools(ctx).register(ffmpegTool(process.platform));
    ctx.report(1);
  },
});
