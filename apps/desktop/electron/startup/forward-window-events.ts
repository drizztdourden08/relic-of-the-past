/* @layer electron-main @kind logic */
import type { BrowserWindow } from 'electron';
import { onFullscreenChange } from '../display/mode-switch';
import { emit } from '../lib/ipc/handle';
import { saveWindowState } from '../window/window-state';
import { isEphemeralLaunch } from '../window/startup-config';

const forwardWindowEvents = (mainWindow: BrowserWindow): void => {
  mainWindow.on('maximize', () => emit(mainWindow, 'window:maximized', true));
  mainWindow.on('unmaximize', () => emit(mainWindow, 'window:maximized', false));
  mainWindow.on('enter-full-screen', () => {
    onFullscreenChange(true);
    emit(mainWindow, 'window:fullscreen', true);
  });
  mainWindow.on('leave-full-screen', () => {
    onFullscreenChange(false);
    emit(mainWindow, 'window:fullscreen', false);
  });

  mainWindow.on('close', () => {
    if (!isEphemeralLaunch()) saveWindowState(mainWindow);
  });
};

export { forwardWindowEvents };
