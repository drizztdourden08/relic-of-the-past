/* @layer renderer-stores @kind logic */
import type { GameSettings } from '@rotp/features';
import { controlSchemeOf } from '@rotp/features';
import { setTakeover } from '@rotp/game-core';
import { setControlScheme, setSchemeAssignments } from '@rotp/input-mapping';
import { useControlSchemeStore } from './useControlSchemeStore';
import { enhancedPauseDrawn } from './enhanced-pause-drawn';

const syncControlSettings = (settings: GameSettings): void => {
  const scheme = controlSchemeOf(settings);
  const assignments = settings.modernScheme.assignments;
  useControlSchemeStore.getState()._sync({ scheme, assignments });
  setControlScheme(scheme, settings.mapOnSelect === true);
  setSchemeAssignments({ assignments });
  setTakeover(!settings.vanillaSafe && enhancedPauseDrawn(settings));
};

export { syncControlSettings };
