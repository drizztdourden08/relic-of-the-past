/* @layer electron-main @kind logic */
/**
 * The death notices Electron hands the main process: a renderer or a child process
 * (GPU, utility, ...) going away, and a page that stops answering. All hooked at the
 * app level, so every window and every webContents is covered without the window
 * layer knowing about it. Written synchronously: a dying GPU process can take the
 * browser process with it in the same instant.
 */
import { app } from 'electron';
import type { WebContents } from 'electron';
import { noteSync } from './forensics-log';

const describe = (wc: WebContents): string => {
  try {
    return `webContents=${wc.id} type=${wc.getType()}`;
  } catch {
    return 'webContents=destroyed';
  }
};

const installProcessGoneHooks = (): void => {
  app.on('render-process-gone', (_event, wc, { reason, exitCode }) => {
    noteSync('error', `render-process-gone reason=${reason} exitCode=${exitCode} ${describe(wc)}`);
  });
  app.on('child-process-gone', (_event, { type, reason, exitCode, name, serviceName }) => {
    noteSync('error', `child-process-gone type=${type} reason=${reason} exitCode=${exitCode} name=${name ?? '-'} serviceName=${serviceName ?? '-'}`);
  });
  app.on('web-contents-created', (_event, wc) => {
    wc.on('unresponsive', () => noteSync('warn', `unresponsive ${describe(wc)}`));
    wc.on('responsive', () => noteSync('info', `responsive ${describe(wc)}`));
  });
};

export { installProcessGoneHooks };
