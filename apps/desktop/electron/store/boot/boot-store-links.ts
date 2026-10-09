/* @layer electron-main @kind logic */
import type { BrowserWindow } from 'electron';
import { claimProtocol, deliverInstallLink, registerInstallLinks } from '../deep-link';
import { listenForLinks } from '../link-handoff';

const bootStoreLinks = (window: BrowserWindow): void => {
  registerInstallLinks(window);
  void listenForLinks(deliverInstallLink);
  claimProtocol();
};

export { bootStoreLinks };
