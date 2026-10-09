/* @layer electron-main @kind logic */
import { isAutomationLaunch } from '../../instance';

const isIsolatedHandover = (): boolean => {
  const has = (flag: string): boolean => process.argv.some((arg) => arg === flag || arg.startsWith(`${flag}=`));
  return has('--visible') && has('--user-data') && !has('--window-size') && !has('--fresh');
};

const isEphemeralLaunch = (): boolean => isAutomationLaunch() && !isIsolatedHandover();

export { isEphemeralLaunch };
