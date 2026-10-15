/* @layer tests @kind helper */
import { launchAppForTest } from '@drizztdourden08/brock-build/testing';
import { APP_DIR } from './isolated-app.constants';
import { makeUserData, removeUserData } from './make-user-data';
import { assertLaunchedViaCli } from './require-cli';
import type { LaunchOptions, LaunchedApp } from './isolated-app.type';

const launchApp = async (options: LaunchOptions): Promise<LaunchedApp> => {
  assertLaunchedViaCli();
  const { args = [], ...seed } = options;
  const profile = makeUserData(seed);
  try {
    const { app, page, close } = await launchAppForTest({
      appDir: APP_DIR,
      userData: profile,
      args: [`--instance=${seed.instance}`, ...args],
      env: { NODE_ENV: 'production' },
    });
    const closeAndClean = async (): Promise<void> => {
      await close().catch(() => undefined);
      removeUserData(profile);
    };
    return { app, window: page, userData: profile, close: closeAndClean };
  } catch (error) {
    removeUserData(profile);
    throw error;
  }
};

export { launchApp };
