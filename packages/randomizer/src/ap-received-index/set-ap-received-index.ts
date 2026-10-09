/* @layer bridge-wasm @kind logic */
import { getModule, hasCoreExport } from '@rotp/game-core';
import { SET_EXPORT } from './ap-received-index.constants';

const setApReceivedIndex = (index: number): boolean => {
  const mod = getModule();
  if (!mod || !hasCoreExport(SET_EXPORT)) return false;
  try {
    mod.ccall(SET_EXPORT, null, ['number'], [index]);
    return true;
  } catch {
    return false;
  }
};

export { setApReceivedIndex };
