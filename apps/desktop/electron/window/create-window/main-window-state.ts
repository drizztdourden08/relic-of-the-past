/* @layer electron-main @kind logic */
import type { BrowserWindow } from 'electron';

const mainWindowState = { window: null as BrowserWindow | null };

export { mainWindowState };
