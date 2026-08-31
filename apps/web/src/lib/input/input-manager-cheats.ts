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

/** Twenty hearts, the engine's ceiling — the core clamps anything above it. */
const FULL_HEALTH = 160;

/** Register the cheat-* function actions so their bindings actually do something. */
const wireCheatActions = (m: InputManager): void => {
  // Heals to the capacity the player has actually earned: the core clamps the request down to
  // link_health_capacity, so asking for the ceiling never raises it. Topping up mid-run must not
  // hand out heart containers the player still wants to go and find.
  m.functionActions.onAction('cheat-health', () => cheatSetHealth(FULL_HEALTH));
  // The separate action for the part that was split out of cheat-health above.
  m.functionActions.onAction('cheat-max-health', () => {
    cheatSetMaxHealth(FULL_HEALTH);
    cheatSetHealth(FULL_HEALTH);
  });
  m.functionActions.onAction('cheat-kill-enemies', () => cheatKillAllEnemies());
  m.functionActions.onAction('cheat-restore-magic', () => cheatRefillMagic());
  // Toggle — press once to enable, again to disable. Shares state with the Cheats widget's
  // movement-restriction switch via getIgnoreCollisionEnabled so both stay in sync.
  m.functionActions.onAction('cheat-ignore-collision', () => cheatSetIgnoreCollision(!getIgnoreCollisionEnabled()));
};

export { wireCheatActions };
