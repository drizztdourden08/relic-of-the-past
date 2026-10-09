/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import { getInputManager } from '../../../../../../lib/game';
import { findFunctionMapping } from './find-function-mapping';

const useControllerOverlay = (paused: boolean) => {
  return useMemo(() => {
    const mgr = getInputManager();
    const mappings = mgr.getFunctionMappings();
    return {
      pauseMapping: findFunctionMapping(mappings, 'pause'),
      prevMapping: findFunctionMapping(mappings, 'profile-prev'),
      nextMapping: findFunctionMapping(mappings, 'profile-next'),
      canSwitchProfile: mgr.getProfiles().length > 1,
      onResume: () => mgr.resume(),
    };
  }, [paused]);
};

export { useControllerOverlay };
