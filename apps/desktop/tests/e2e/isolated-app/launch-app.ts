/* @layer tests @kind helper */
import { _electron as electron } from 'playwright';
import { MAIN_JS } from './isolated-app.constants';
import { makeUserData, removeUserData } from './make-user-data';
import { waitForMainWindow } from './main-window';
import type { LaunchOptions, LaunchedApp, StartedApp } from './isolated-app.type';

const ignoreAlreadyClosed = (): void => undefined;

// Starts the built app into its own seeded user data, headless (`--no-focus --muted`), without waiting for a window.
// For launches that finish by themselves (`--dump-nav`). `close` shuts the app and deletes the user data.
const startApp = async (options: LaunchOptions): Promise<StartedApp> => {
  const { args = [], ...seed } = options;
  const userData = makeUserData(seed);
  try {
    const app = await electron.launch({
      args: [MAIN_JS, '--muted', '--no-focus', `--instance=${seed.instance}`, `--user-data=${userData}`, ...args],
      env: { ...process.env, NODE_ENV: 'production' },
    });
    const close = async (): Promise<void> => {
      await app.close().catch(ignoreAlreadyClosed);
      removeUserData(userData);
    };
    return { app, userData, close };
  } catch (error) {
    removeUserData(userData);
    throw error;
  }
};

// `startApp`, then the MAIN window (never the splash). Call `close` in a `finally`.
const launchApp = async (options: LaunchOptions): Promise<LaunchedApp> => {
  const started = await startApp(options);
  try {
    return { ...started, window: await waitForMainWindow(started.app) };
  } catch (error) {
    await started.close();
    throw error;
  }
};

export { launchApp, startApp };
