/* @layer bridge-wasm @kind logic */
import { getModule } from '../wasm-bridge';
import { hasCoreExport } from '../has-core-export';
import { SET_EXPORT } from './ap-room-hash.constants';

const setApRoomHash = (hash: number): void => {
  const mod = getModule();
  if (!mod || !hasCoreExport(SET_EXPORT)) return;
  try {
    mod.ccall(SET_EXPORT, null, ['number'], [hash | 0]);
  } catch {
    return;
  }
};

export { setApRoomHash };
