/* @layer renderer-lib @kind logic */
import type { InputManager } from './input-manager';
import { managerInstance } from './manager-instance';

const peekInputManager = (): InputManager | null => managerInstance.current;

export { peekInputManager };
