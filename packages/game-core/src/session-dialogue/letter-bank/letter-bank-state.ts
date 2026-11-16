/* @layer bridge-wasm @kind logic */
import type { LetterSlot } from '@rotp/game-data';

const letterBankState: { letters: readonly LetterSlot[] } = { letters: [] };

export { letterBankState };
