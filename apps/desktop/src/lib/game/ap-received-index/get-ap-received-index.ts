/* @layer bridge-wasm @kind logic */
import { getModule } from '../wasm-bridge';
import { hasCoreExport } from '../has-core-export';
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
