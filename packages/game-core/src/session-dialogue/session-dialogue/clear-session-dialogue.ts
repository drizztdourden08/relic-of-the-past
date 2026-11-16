/* @layer bridge-wasm @kind logic */
import { getModule } from '../../wasm-bridge';
import { createArrivalRing } from '../arrival-ring';
import { clearExtraGlyphs } from '../extra-glyphs';
import { clearLetterBank } from '../letter-bank';
import { sessionPool } from './session-pool';

const clearSessionDialogue = (): void => {
  sessionPool.plannedLines = [];
  sessionPool.arrivals = createArrivalRing();
  sessionPool.active = null;
  sessionPool.baseId = null;
  sessionPool.encoded.clear();
  const mod = getModule();
  clearExtraGlyphs(mod);
  clearLetterBank(mod);
  if (mod) mod.ccall('WasmClearSessionDialogue', null, [], []);
};

export { clearSessionDialogue };
