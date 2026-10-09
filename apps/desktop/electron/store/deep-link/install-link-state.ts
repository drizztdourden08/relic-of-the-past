/* @layer electron-main @kind logic */
import type { BrowserWindow } from 'electron';
import type { InstallLink } from '@shared/store/deep-link';

const installLinkState = {
  target: null as BrowserWindow | null,
  shellReady: false,
  queued: [] as InstallLink[],
};

export { installLinkState };
