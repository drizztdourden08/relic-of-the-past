/* @layer electron-main @kind logic */
import type { BrowserWindowConstructorOptions } from 'electron';
import { join } from 'path';
import { resolveWindowIcon } from '../window-icon';
import { startupRendererArgs } from '../startup-config';
import type { StartupConfig } from '../startup-config';
import type { WindowState } from '../window-state';
import { APP_TITLE } from './create-window.constants';
import { offscreenOrigin } from './offscreen-origin';

const mainWindowOptions = (
  noFocus: boolean, startup: StartupConfig, instanceName: string | null, saved: WindowState,
): BrowserWindowConstructorOptions => ({
  width: startup.windowSize?.width ?? saved.width,
  height: startup.windowSize?.height ?? saved.height,
  minWidth: 360,
  minHeight: 280,
  ...(noFocus ? offscreenOrigin() : {}),
  center: false,
  titleBarStyle: 'hidden',
  autoHideMenuBar: true,
  title: instanceName ? `${APP_TITLE} - ${instanceName}` : APP_TITLE,
  icon: resolveWindowIcon(instanceName),
  backgroundColor: '#000000',
  opacity: noFocus ? 1 : 0,
  show: false,
  focusable: !noFocus,
  paintWhenInitiallyHidden: true,
  webPreferences: {
    preload: join(__dirname, '../preload/preload.mjs'),
    sandbox: false,
    contextIsolation: true,
    nodeIntegration: false,
    backgroundThrottling: false,
    additionalArguments: startupRendererArgs(startup),
  },
});

export { mainWindowOptions };
