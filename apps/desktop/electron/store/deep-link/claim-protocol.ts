/* @layer electron-main @kind logic */
import { app } from 'electron';
import { INSTALL_SCHEME } from '@shared/store/deep-link';
import { rotpAutomationFlags } from '../../automation/rotp-automation-flags';

const claimProtocol = (): void => {
  if (rotpAutomationFlags.isAutomationLaunch() || !app.isPackaged) return;
  app.setAsDefaultProtocolClient(INSTALL_SCHEME);
};

export { claimProtocol };
