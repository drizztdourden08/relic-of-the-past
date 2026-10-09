/* @layer electron-main @kind logic */
import type { BrowserWindow } from 'electron';
import { installLinkFromArgv } from '@shared/store/deep-link';
import { on } from '../../lib/ipc/handle';
import { deliverInstallLink } from './deliver-install-link';
import { installLinkState } from './install-link-state';

const registerInstallLinks = (window: BrowserWindow): void => {
  installLinkState.target = window;
  on('window:shellReady', () => {
    installLinkState.shellReady = true;
    for (const link of installLinkState.queued.splice(0)) deliverInstallLink(link);
  });
  const launchLink = installLinkFromArgv(process.argv);
  if (launchLink) deliverInstallLink(launchLink);
};

export { registerInstallLinks };
