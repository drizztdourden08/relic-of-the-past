/* @layer renderer-stores @kind logic */
import type { GameSettings } from '@rotp/features';
import { controlSchemeOf } from '@rotp/features';
import { setTakeover } from '@app/lib/game/host-menu';
import { setControlScheme, setSchemeAssignments } from '@rotp/input-mapping';
import { useControlSchemeStore } from './useControlSchemeStore';
import { migratedAssignments } from './migrated-assignments';
import { enhancedPauseDrawn } from './enhanced-pause-drawn';

const syncControlSettings = (settings: GameSettings): void => {
  const scheme = controlSchemeOf(settings);
  const assignments = migratedAssignments(settings);
  useControlSchemeStore.getState()._sync({ scheme, assignments });
  setControlScheme(scheme, settings.mapOnSelect === true);
  setSchemeAssignments({ assignments });
  setTakeover(!settings.vanillaSafe && enhancedPauseDrawn(settings));
};

export { syncControlSettings };
