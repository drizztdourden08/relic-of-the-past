/* @layer renderer-stores @kind logic */
import type { GameSettings } from '@rotp/features';
import { migrateScheme } from '@rotp/input-mapping';
import type { Assignments } from './control-scheme-store.type';
import { useControlSchemeStore } from './useControlSchemeStore';

const migratedAssignments = (settings: GameSettings): Assignments => {
  const stored = settings.modernScheme.assignments;
  const keys = Object.keys(stored);
  if (keys.every((key) => Number.isInteger(Number(key)))) return stored;
  const slots = useControlSchemeStore.getState().bindings?.slots;
  if (!slots || slots.length === 0) return stored;
  return migrateScheme(slots, stored).assignments;
};

export { migratedAssignments };
