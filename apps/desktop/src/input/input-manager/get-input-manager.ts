/* @layer renderer-lib @kind logic */
import { InputManager } from './input-manager';
import { managerInstance } from './manager-instance';

const getInputManager = (): InputManager => {
  if (!managerInstance.current) {
    managerInstance.current = new InputManager();
    managerInstance.current.start();
  }
  if (typeof window !== 'undefined') Object.assign(window, { __inputManager: managerInstance.current });
  return managerInstance.current;
};

export { getInputManager };
