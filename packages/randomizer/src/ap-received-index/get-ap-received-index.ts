/* @layer bridge-wasm @kind logic */
import { getModule, hasCoreExport } from '@rotp/game-core';
import { GET_EXPORT } from './ap-received-index.constants';

const getApReceivedIndex = (): number | null => {
  const mod = getModule();
  if (!mod || !hasCoreExport(GET_EXPORT)) return null;
  try {
    return mod.ccall(GET_EXPORT, 'number', [], []);
  } catch {
    return null;
  }
};

export { getApReceivedIndex };
