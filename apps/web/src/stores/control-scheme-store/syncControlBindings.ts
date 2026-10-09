/* @layer renderer-stores @kind logic */
import type { ModernBindings } from '@shared/types/controls';
import { useControlSchemeStore } from './useControlSchemeStore';
import { reapplyControlSettings } from './reapplyControlSettings';

const syncControlBindings = (bindings: ModernBindings | null): void => {
  if (useControlSchemeStore.getState().bindings === bindings) return;
  useControlSchemeStore.getState()._sync({ bindings });
  reapplyControlSettings();
};

export { syncControlBindings };
