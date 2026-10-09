/* @layer renderer-lib @kind logic */
import type { InputManager } from './input-manager';

const keyUp = (m: InputManager, e: KeyboardEvent): void => {
  m.allPressedKeys.delete(e.code);
  if (m.keyboardMap.has(e.code)) {
    m.keyStates.set(e.code, false);
  }
  if (!m.inputSuppressed) {
    m.functionActions.handleKeyUp(e.code);
  }
};

export { keyUp };
