/* @layer electron-main @kind logic */
import { installLinkFromArgv } from '@shared/store/deep-link';
import { rotpAutomationFlags } from '../../automation/rotp-automation-flags';
import { handOff } from './hand-off';

const handOffLaunchLink = async (): Promise<boolean> => {
  if (rotpAutomationFlags.isAutomationLaunch()) return false;
  const link = installLinkFromArgv(process.argv);
  return link ? handOff(link) : false;
};

export { handOffLaunchLink };
