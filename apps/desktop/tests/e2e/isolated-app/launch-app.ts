/* @layer tests @kind helper */
import { launchAppForTest } from '@drizztdourden08/brock-build/testing';
import { _electron as electron } from 'playwright';
import { APP_DIR, MAIN_JS } from './isolated-app.constants';
import { makeUserData, removeUserData } from './make-user-data';
import { assertLaunchedViaCli } from './require-cli';
import type { LaunchOptions, LaunchedApp, StartedApp } from './isolated-app.type';

const ignoreAlreadyClosed = (): void => undefined;

const startApp = async (options: LaunchOptions): Promise<StartedApp> => {
  assertLaunchedViaCli();
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

const launchApp = async (options: LaunchOptions): Promise<LaunchedApp> => {
  assertLaunchedViaCli();
  const { args = [], ...seed } = options;
  const userData = makeUserData(seed);
  try {
    const launched = await launchAppForTest({
      appDir: APP_DIR,
      userData,
      args: [`--instance=${seed.instance}`, ...args],
      env: { NODE_ENV: 'production' },
    });
    const close = async (): Promise<void> => {
      await launched.close().catch(ignoreAlreadyClosed);
      removeUserData(userData);
    };
    return { app: launched.app, window: launched.page, userData, close };
  } catch (error) {
    removeUserData(userData);
    throw error;
  }
};

export { launchApp, startApp };
