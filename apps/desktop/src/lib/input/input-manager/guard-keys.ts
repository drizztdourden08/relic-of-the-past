/* @layer renderer-lib @kind logic */
import type { InputManager } from './input-manager';
import { isTextInput } from './is-text-input';

const guardKeys = (m: InputManager, e: KeyboardEvent): void => {
  if (e.code === 'Escape' || e.key === 'Escape') return;
  if (isTextInput(e.target) || m.inputSuppressed) {
    e.stopPropagation();
  }
};

export { guardKeys };
