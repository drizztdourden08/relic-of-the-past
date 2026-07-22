/* @layer renderer-appshell @kind hook */
/**
 * Bundles the CLI-driven launch hooks (auto-test, dump-layers, dump-nav, sim-run)
 * behind one call so the AppMain view stays lean. Each is a no-op unless its flag
 * is present.
 */
import { useAutoTest } from './useAutoTest';
import { useDumpLayers } from './useDumpLayers';
import { useDumpNav } from './useDumpNav';
import { useSimRun } from './useSimRun';

interface DebugLaunchDeps {
  activeProfile: Profile | null;
  loadProfileForGame: (profile: Profile) => Promise<void>;
  openNavWidget: () => void;
}

const useDebugLaunchHooks = ({ activeProfile, loadProfileForGame, openNavWidget }: DebugLaunchDeps) => {
  useAutoTest({ activeProfile, loadProfileForGame });
  useDumpLayers({ activeProfile, loadProfileForGame, openNavWidget });
  useDumpNav({ activeProfile, loadProfileForGame });
  useSimRun({ activeProfile, loadProfileForGame });
};

export { useDebugLaunchHooks };
