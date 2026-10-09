/* @layer electron-main @kind logic */
import { loadAddon } from './load-addon';

const startJoystickCapture = (joystickId: number): boolean => {
  return loadAddon()?.startJoystickCapture(joystickId) ?? false;
};

export { startJoystickCapture };
