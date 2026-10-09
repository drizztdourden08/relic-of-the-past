/* @layer electron-main @kind logic */
import { installLinkFromArgv } from '@shared/store/deep-link';
import { isAutomationLaunch } from '../../instance';
import { handOff } from './hand-off';

const handOffLaunchLink = async (): Promise<boolean> => {
  if (isAutomationLaunch()) return false;
  const link = installLinkFromArgv(process.argv);
  return link ? handOff(link) : false;
};

export { handOffLaunchLink };
