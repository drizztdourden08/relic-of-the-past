/* @layer electron-main @kind logic */
import { HEADLESS_FLAGS } from './automation-launch.constants';

const isHeadlessLaunch = (): boolean => {
  if (process.argv.includes('--visible')) return false;
  return process.argv.some((arg) =>
    HEADLESS_FLAGS.some((flag) => arg === flag || arg.startsWith(`${flag}=`)),
  );
};

export { isHeadlessLaunch };
