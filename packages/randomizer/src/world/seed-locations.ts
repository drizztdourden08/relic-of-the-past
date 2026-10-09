/* @layer shared-game @kind logic */
import type { CheckRecord } from '@rotp/game-data';

const isSeedLocation = (check: CheckRecord): boolean => {
  const { kind, scope } = check;
  if (scope === 'fixed') return false;
  if (kind === 'shop-slot') return false;
  if (kind === 'event') return false;
  if (kind === 'npc') return scope !== undefined;
  return true;
};

export { isSeedLocation };
