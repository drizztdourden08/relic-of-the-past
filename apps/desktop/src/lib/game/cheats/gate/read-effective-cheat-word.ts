/* @layer bridge-wasm @kind logic */
import { getModule } from '../../wasm-bridge';
import { GATE_WORD_CHEATS, GATE_WORD_UNREADABLE } from '../cheats.constants';

const readEffectiveCheatWord = (): number => {
  const mod = getModule();
  if (!mod) return GATE_WORD_UNREADABLE;
  try {
    return mod.ccall('WasmGetEffectiveGateWord', 'number', ['number'], [GATE_WORD_CHEATS]) as number;
  } catch {
    return GATE_WORD_UNREADABLE;
  }
};

export { readEffectiveCheatWord };
