/* @layer renderer-lib @kind logic */
/**
 * Cheat function-action wiring for InputManager — binds `cheat-health` (defined in
 * shared/types/controls/functions.ts, rebindable in Settings → Controls → Cheats) to
 * the same full-heal call the Cheats widget's "Full Heal" button uses. Until this
 * wiring existed the binding was registered but had no listener, so pressing it did
 * nothing on keyboard or controller (issue #130).
 */
import type { InputManager } from './input-manager';
import { cheatSetHealth, cheatSetMaxHealth } from '../game/cheats';

const FULL_HEALTH = 160;

/** Register the cheat-* function actions so their bindings actually do something. */
const wireCheatActions = (m: InputManager): void => {
  m.functionActions.onAction('cheat-health', () => {
    cheatSetHealth(FULL_HEALTH);
    cheatSetMaxHealth(FULL_HEALTH);
  });
};

export { wireCheatActions };
