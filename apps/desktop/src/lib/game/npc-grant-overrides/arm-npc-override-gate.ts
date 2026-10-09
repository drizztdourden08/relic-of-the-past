/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { reassertGateWord3 } from '../live-settings';
import { setNpcOverridesActive } from '../live-settings-flags';
import { getModule } from '../wasm-bridge';

const armNpcOverrideGate = (): ReturnType<typeof getModule> => {
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] npc override setter called with no active module');
    return null;
  }
  setNpcOverridesActive(true);
  reassertGateWord3();
  return mod;
};

export { armNpcOverrideGate };
