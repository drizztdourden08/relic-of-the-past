/* @layer renderer-stores @kind logic */
import type { PauseState } from '@shared/game/logic/pause';
import { closeHostMenu, saveAndQuitHostMenu } from '@app/lib/game/host-menu';
import { wasmGetMenuState } from '@app/lib/game/wasm-bridge';
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
