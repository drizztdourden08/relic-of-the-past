/* @layer electron-main @kind logic */
/**
 * Records how the app was asked to leave, so a log that ends in a quit can be told
 * apart from one that ends in a death. The origin is whichever fired first:
 * `window-all-closed` (the user closed the window), `app.quit` (an explicit call, such
 * as the updater's), `app.exit` (the immediate form). A quit event that arrives with
 * no origin recorded came from outside our code: the OS ending the session, a signal,
 * or a kill. app.quit / app.exit are wrapped, never replaced: the original runs
 * unchanged after the mark. Written synchronously; `quit` is the last event before exit.
 */
import { app } from 'electron';
import { noteSync } from './forensics-log';

type QuitOrigin = 'window-all-closed' | 'app.quit' | 'app.exit' | 'external';

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
