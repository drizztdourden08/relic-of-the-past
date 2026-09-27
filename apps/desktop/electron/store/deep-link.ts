/* @layer electron-main @kind logic */
/**
 * rotp://install links. The protocol is claimed by the player's own app only: never by an
 * automation launch, and never by a development build, which would take the links away from
 * the installed app. A link arrives three ways: in argv when the browser started this
 * process, as macOS `open-url`, or over the hand-off pipe from a process the browser started.
 * Each one is held until the renderer's shell has painted, then sent as `store:openInstall`,
 * and the window comes forward, since the player just asked for the install in the browser.
 */
import { app } from 'electron';
import type { BrowserWindow } from 'electron';
import { installLinkFromArgv, parseInstallLink } from '@shared/store/deep-link';
import type { InstallLink } from '@shared/store/deep-link';
import { isAutomationLaunch } from '../instance';
import { emit, on } from '../lib/ipc/handle';

const PROTOCOL = 'rotp';

let target: BrowserWindow | null = null;
let shellReady = false;
const queued: InstallLink[] = [];

const bringForward = (window: BrowserWindow): void => {
  if (window.isMinimized()) window.restore();
  window.show();
  window.focus();
};

const deliverInstallLink = (link: InstallLink): void => {
  if (!target || !shellReady) {
    queued.push(link);
    return;
  }
  if (!isAutomationLaunch()) bringForward(target);
  emit(target, 'store:openInstall', { itemId: link.itemId, version: link.version });
};

const claimProtocol = (): void => {
  if (isAutomationLaunch() || !app.isPackaged) return;
  app.setAsDefaultProtocolClient(PROTOCOL);
};

/** macOS hands a link over as an event, possibly before the app is ready; register early. */
const listenForOpenUrl = (): void => {
  app.on('open-url', (event, url) => {
    event.preventDefault();
    const link = parseInstallLink(url);
    if (link) deliverInstallLink(link);
  });
};

/** The window the links go to, plus the link this process was started with, if any. */
const registerInstallLinks = (window: BrowserWindow): void => {
  target = window;
  on('window:shellReady', () => {
    shellReady = true;
    for (const link of queued.splice(0)) deliverInstallLink(link);
  });
  const launchLink = installLinkFromArgv(process.argv);
  if (launchLink) deliverInstallLink(launchLink);
};

export { claimProtocol, listenForOpenUrl, registerInstallLinks, deliverInstallLink, PROTOCOL };
