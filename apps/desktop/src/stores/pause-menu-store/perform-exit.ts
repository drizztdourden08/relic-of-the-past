/* @layer renderer-stores @kind logic */
import type { PauseState } from '@rotp/game-data';
import { closeHostMenu, saveAndQuitHostMenu } from '@rotp/game-core';
import { wasmGetMenuState } from '@rotp/game-core';
import { NATIVE_MENU_OPEN } from './pause-menu-store.constants';

const coreWillExit = (): boolean => wasmGetMenuState() === NATIVE_MENU_OPEN;

const performExit = (prev: PauseState, next: PauseState): boolean => {
  if (next.phase !== 'closing' || prev.phase === 'closing') return true;
  if (!coreWillExit()) return false;
  if (next.via === 'save-quit') saveAndQuitHostMenu();
  else closeHostMenu();
  return true;
};

export { performExit };
