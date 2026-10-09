/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { getModule } from '../wasm-bridge';
import { GATE_WORD } from './gate-word-5.constants';
import { gateWord5Now } from './gate-word-5-now';

const writeGateWord5 = (): void => {
  const mod = getModule();
  if (!mod) return;
  try {
    mod.ccall('WasmSetGateWord', null, ['number', 'number'], [GATE_WORD, gateWord5Now()]);
  } catch {
    log.error('[Gate] this core has no gate word 5');
  }
};

export { writeGateWord5 };
