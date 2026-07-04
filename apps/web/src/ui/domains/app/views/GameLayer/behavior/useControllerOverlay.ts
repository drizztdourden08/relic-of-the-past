/* @layer renderer-components @kind hook */
/**
 * useControllerOverlay — resolves the data the disconnect overlay needs: the bound
 * resume (pause) shortcut, the profile prev/next shortcuts, whether more than one
 * profile exists (to offer switching), and a manual-resume handler.
 * Recomputed when `paused` flips so it reflects the current bindings/profiles.
 */

import { useMemo } from 'react';
import { getInputManager } from '../../../../../../lib/game';
import type { FunctionAction, FunctionMapping } from '@shared/types/controls';

const findMapping = (mappings: FunctionMapping[], action: FunctionAction): FunctionMapping | null =>
  mappings.find(m => m.action === action && m.binding.type !== 'none') ?? null;

const useControllerOverlay = (paused: boolean) => {
  return useMemo(() => {
    const mgr = getInputManager();
    const mappings = mgr.getFunctionMappings();
    return {
      pauseMapping: findMapping(mappings, 'pause'),
      prevMapping: findMapping(mappings, 'profile-prev'),
      nextMapping: findMapping(mappings, 'profile-next'),
      canSwitchProfile: mgr.getProfiles().length > 1,
      onResume: () => mgr.resume(),
    };
  }, [paused]);
};

export { useControllerOverlay };
