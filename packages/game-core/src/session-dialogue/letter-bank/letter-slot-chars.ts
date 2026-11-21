/* @layer bridge-wasm @kind logic */
import { GLYPH_SLOTS } from '@rotp/game-data';
import type { ExtraGlyphSlot } from '@rotp/game-data';
import { callPtr, readU16 } from '../../bridge/wasm-call';
import { letterBankState } from './letter-bank-state';

const letterSlotChars = (): readonly ExtraGlyphSlot[] => {
  const letters = letterBankState.letters;
  if (letters.length === 0) return [];
  return callPtr('WasmLetterBankSlots', (mod, ptr) => {
    const slots: ExtraGlyphSlot[] = [];
    for (let slot = 0; slot < GLYPH_SLOTS; slot++) {
      const held = readU16(mod.HEAPU8, ptr + slot * 2);
      const letter = held > 0 ? letters[held - 1] : undefined;
      if (letter !== undefined) slots.push({ char: letter.char, slot, width: letter.width });
    }
    return slots;
  }) ?? [];
};

export { letterSlotChars };
