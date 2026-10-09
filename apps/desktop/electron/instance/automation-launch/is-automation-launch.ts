/* @layer electron-main @kind logic */
import { AUTOMATION_FLAGS } from './automation-launch.constants';

const isAutomationLaunch = (): boolean =>
  process.argv.some((arg) =>
    AUTOMATION_FLAGS.some((flag) => arg === flag || arg.startsWith(`${flag}=`)),
  );

export { isAutomationLaunch };
