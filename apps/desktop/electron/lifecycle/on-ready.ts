/* @layer electron-main @kind logic */
import { app } from 'electron';
import type { MainContext } from '@drizztdourden08/brock-electron/main';
import { registerDebugCaptureProtocol } from '../protocol/debug-capture-protocol';
import { registerInstallSize } from '../app/install-size-type';

const onReady = (ctx: MainContext): void => {
  registerDebugCaptureProtocol();
  if (app.isPackaged) void registerInstallSize();
  ctx.log('Relic of the Past main process ready');
};

export { onReady };
