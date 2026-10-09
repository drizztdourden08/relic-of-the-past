/* @layer electron-main @kind logic */
import { app } from 'electron';
import { INSTALL_SCHEME } from '@shared/store/deep-link';
import { isAutomationLaunch } from '../../instance';

const claimProtocol = (): void => {
  if (isAutomationLaunch() || !app.isPackaged) return;
  app.setAsDefaultProtocolClient(INSTALL_SCHEME);
};

export { claimProtocol };
