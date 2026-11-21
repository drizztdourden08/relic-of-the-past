/* @layer electron-main @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { defineBootTask } from '@drizztdourden08/brock-electron/main';
import { getTools } from '@drizztdourden08/brock-tools/main';
import { ffmpegTool } from '../tools/ffmpeg-tool';

export default defineBootTask({
  label: msg('main:boot.ffmpeg'),
  run: (ctx) => {
    getTools(ctx).register(ffmpegTool(process.platform));
    ctx.report(1);
  },
});
