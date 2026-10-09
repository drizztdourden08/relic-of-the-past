/* @layer electron-main @kind logic */
import { app } from 'electron';
import { noteSync } from './forensics-log';
import type { QuitOrigin } from './quit-hooks.type';

let origin: QuitOrigin | null = null;

const recordOrigin = (candidate: QuitOrigin): void => {
  origin ??= candidate;
};

const originLabel = (): QuitOrigin => origin ?? 'external';

const wrapQuitCalls = (): void => {
  const quit = app.quit.bind(app);
  const exit = app.exit.bind(app);
  app.quit = () => {
    recordOrigin('app.quit');
    quit();
  };
  app.exit = (exitCode?: number) => {
    recordOrigin('app.exit');
    noteSync('info', `app.exit exitCode=${exitCode ?? 0}`);
    exit(exitCode);
  };
};

const installQuitHooks = (): void => {
  wrapQuitCalls();
  app.on('window-all-closed', () => {
    recordOrigin('window-all-closed');
    noteSync('info', 'window-all-closed');
  });
  app.on('before-quit', () => noteSync('info', `before-quit origin=${originLabel()}`));
  app.on('will-quit', () => noteSync('info', `will-quit origin=${originLabel()}`));
  app.on('quit', (_event, exitCode) => noteSync('info', `quit origin=${originLabel()} exitCode=${exitCode}`));
};

export { installQuitHooks };
