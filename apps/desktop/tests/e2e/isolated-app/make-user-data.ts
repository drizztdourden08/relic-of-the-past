/* @layer tests @kind helper */
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { KEEP_USER_DATA_ENV, USER_DATA_PREFIX } from './isolated-app.constants';
import { seedProfile } from './seed-profile';
import type { ProfileSeed } from './isolated-app.type';

const ignoreCleanupFailure = (): void => undefined;

const removeUserData = (userData: string): void => {
  if (process.env[KEEP_USER_DATA_ENV]) return;
  try {
    rmSync(userData, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
  } catch {
    ignoreCleanupFailure();
  }
};

const makeUserData = (seed: ProfileSeed): string => {
  const userData = mkdtempSync(join(tmpdir(), USER_DATA_PREFIX));
  try {
    seedProfile(userData, seed);
  } catch (error) {
    removeUserData(userData);
    throw error;
  }
  return userData;
};

export { makeUserData, removeUserData };
