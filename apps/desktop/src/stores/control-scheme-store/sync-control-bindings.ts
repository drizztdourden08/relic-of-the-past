/* @layer renderer-stores @kind logic */
import type { ModernBindings } from '@rotp/game-data';
import { useControlSchemeStore } from './useControlSchemeStore';
import { reapplyControlSettings } from './reapply-control-settings';

const syncControlBindings = (bindings: ModernBindings | null): void => {
  if (useControlSchemeStore.getState().bindings === bindings) return;
  useControlSchemeStore.getState()._sync({ bindings });
  reapplyControlSettings();
};

export { syncControlBindings };
