/* @layer electron-main @kind barrel */
export { createWindow, getMainWindow } from './create-window';
export { registerWindowHandlers } from './ipc-handlers';
export { registerAspectRatioHandlers } from './aspect-ratio';
export { setSplashStatus, revealMainWindow } from './boot';
