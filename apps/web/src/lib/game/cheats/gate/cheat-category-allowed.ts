/* @layer bridge-wasm @kind logic */
import type { CheatCategory } from '../cheats.type';
import { CATEGORY_GATE_BIT, GATE_CHEATS_ENABLED } from '../cheats.constants';
import { readEffectiveCheatWord } from './read-effective-cheat-word';

const cheatCategoryAllowed = (category: CheatCategory): boolean => {
  const word = readEffectiveCheatWord();
  return (word & GATE_CHEATS_ENABLED) !== 0 && (word & CATEGORY_GATE_BIT[category]) !== 0;
};

export { cheatCategoryAllowed };
