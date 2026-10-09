/* @layer renderer-appshell @kind hook */
import { useAutoTest } from './useAutoTest';
import { useDumpLayers } from './useDumpLayers';
import { useDumpNav } from './useDumpNav';
import { useSimRun } from './useSimRun';
import type { DebugLaunchDeps } from './useDebugLaunchHooks.type';

const useDebugLaunchHooks = ({ activeProfile, loadProfileForGame, openNavWidget }: DebugLaunchDeps) => {
  useAutoTest({ activeProfile, loadProfileForGame });
  useDumpLayers({ activeProfile, loadProfileForGame, openNavWidget });
  useDumpNav({ activeProfile, loadProfileForGame });
  useSimRun({ activeProfile, loadProfileForGame });
};

export { useDebugLaunchHooks };
