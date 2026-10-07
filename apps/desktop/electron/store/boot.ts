/* @layer electron-main @kind logic */
/**
 * The Hookshop's part of startup, in the order main.ts calls it. Before the app is ready,
 * macOS link events are caught. Once it is ready and before any window, a process the
 * browser started with a link hands it to the player's running app and quits. Once the main
 * window exists, links reach that window, the player's app listens for links other
 * processes hand over, and the install link type is claimed. Automation launches skip the
 * hand-off, the listening and the claim.
 */
import { app } from 'electron';
import type { BrowserWindow } from 'electron';
import { claimProtocol, deliverInstallLink, listenForOpenUrl, registerInstallLinks } from './deep-link';
import { handOffLaunchLink, listenForLinks } from './link-handoff';

/** True when a running app took this process's link; the process is exiting then. */
const quitIfHandedOff = async (): Promise<boolean> => {
  if (!(await handOffLaunchLink())) return false;
  app.exit(0);
  return true;
};

const bootStoreLinks = (window: BrowserWindow): void => {
  registerInstallLinks(window);
  void listenForLinks(deliverInstallLink);
  claimProtocol();
};

export { listenForOpenUrl, quitIfHandedOff, bootStoreLinks };
