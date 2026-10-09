/* @layer electron-main @kind logic */
import type { BrowserWindow } from 'electron';
import { installLinkFromArgv } from '@shared/store/deep-link';
import { whenRevealed } from '@drizztdourden08/brock-electron/main';
import { deliverInstallLink } from './deliver-install-link';
import { installLinkState } from './install-link-state';

const registerInstallLinks = (window: BrowserWindow): void => {
  installLinkState.target = window;
  void whenRevealed().then(() => {
    installLinkState.shellReady = true;
    for (const link of installLinkState.queued.splice(0)) deliverInstallLink(link);
  });
  const launchLink = installLinkFromArgv(process.argv);
  if (launchLink) deliverInstallLink(launchLink);
};

export { registerInstallLinks };
