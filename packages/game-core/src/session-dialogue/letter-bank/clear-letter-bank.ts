/* @layer bridge-wasm @kind logic */
import type { EmscriptenModule } from '../../types';
import { coreTakesLetters } from './core-takes-letters';
import { letterBankState } from './letter-bank-state';

const clearLetterBank = (mod: EmscriptenModule | null): void => {
  letterBankState.letters = [];
  if (mod && coreTakesLetters(mod)) mod.ccall('WasmClearLetterBank', null, [], []);
};

export { clearLetterBank };
