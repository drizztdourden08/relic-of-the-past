/* @layer renderer-app @kind logic */
import { SNES_BUTTON_BITS } from '@rotp/game-data';

const buttonBit = (name: string): number | null => {
  const wanted = name.trim().toLowerCase();
  const found = Object.entries(SNES_BUTTON_BITS).find(([button]) => button.toLowerCase() === wanted);
  return found === undefined ? null : 1 << found[1];
};

export { buttonBit };
