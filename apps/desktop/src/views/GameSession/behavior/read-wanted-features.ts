/* @layer renderer-appshell @kind logic */
import { getModule } from '@app/game';
import { FEATURES_QUERY_FAILED, MODULE_UNREACHABLE } from './sim-run.constants';

const readWantedFeatures = (): number => {
  const mod = getModule();
  if (!mod) return MODULE_UNREACHABLE;
  try { return Number(mod.ccall('WasmGetFeatures', 'number', [], [])); } catch { return FEATURES_QUERY_FAILED; }
};

export { readWantedFeatures };
