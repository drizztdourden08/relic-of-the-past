/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { getModule } from '../wasm-bridge';

const clearPlayerSprite = (): boolean => {
  const mod = getModule();
  if (!mod) return false;
  try {
    mod.ccall('WasmClearPlayerSprite', null, [], []);
    return true;
  } catch (err) {
    log.error(`[PlayerSprite] Live restore failed: ${err instanceof Error ? err.message : err}`);
    return false;
  }
};

export { clearPlayerSprite };
