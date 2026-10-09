/* @layer bridge-wasm @kind logic */
import { getModule } from '@rotp/game-core';
import { hasCoreExport } from '@rotp/game-core';
import { GET_EXPORT } from './ap-received-index.constants';

const getApReceivedIndex = (): number | null => {
  const mod = getModule();
  if (!mod || !hasCoreExport(GET_EXPORT)) return null;
  try {
    return mod.ccall(GET_EXPORT, 'number', [], []) as number;
  } catch {
    return null;
  }
};

export { getApReceivedIndex };
