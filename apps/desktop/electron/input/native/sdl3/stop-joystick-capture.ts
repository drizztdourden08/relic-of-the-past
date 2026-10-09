/* @layer electron-main @kind logic */
import { loadAddon } from './load-addon';

const stopJoystickCapture = (): void => {
  loadAddon()?.stopJoystickCapture();
};

export { stopJoystickCapture };
