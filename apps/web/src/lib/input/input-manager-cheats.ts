/* @layer renderer-lib @kind logic */
/**
 * Cheat function-action wiring for InputManager — binds every `cheat-*` action (defined in
 * shared/types/controls/functions.ts, rebindable in Settings → Controls → Cheats) to the same
 * calls the Cheats widget's buttons/toggles use, so a binding actually does something the moment
 * it is registered (previously true only for cheat-health — issue #130).
 */
import type { InputManager } from './input-manager';
import {
  cheatSetHealth, cheatSetMaxHealth, cheatKillAllEnemies, cheatRefillMagic,
  cheatSetIgnoreCollision, getIgnoreCollisionEnabled,
} from '../game/cheats';

const FULL_HEALTH = 160;

/** Register the cheat-* function actions so their bindings actually do something. */
const wireCheatActions = (m: InputManager): void => {
  m.functionActions.onAction('cheat-health', () => {
    cheatSetHealth(FULL_HEALTH);
    cheatSetMaxHealth(FULL_HEALTH);
  });
  m.functionActions.onAction('cheat-kill-enemies', () => cheatKillAllEnemies());
  m.functionActions.onAction('cheat-restore-magic', () => cheatRefillMagic());
  // Toggle — press once to enable, again to disable. Shares state with the Cheats widget's
  // movement-restriction switch via getIgnoreCollisionEnabled so both stay in sync.
  m.functionActions.onAction('cheat-ignore-collision', () => cheatSetIgnoreCollision(!getIgnoreCollisionEnabled()));
};

export { wireCheatActions };
