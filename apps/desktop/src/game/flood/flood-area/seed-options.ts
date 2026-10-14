/* @layer bridge-wasm @kind logic */
import type { GridPos } from '@rotp/game-core';
import type { ScreenFloodRequest } from '@rotp/navigation';

const seedOptions = (known: GridPos[], isPrimary: boolean, startPos: GridPos | undefined): Pick<ScreenFloodRequest, 'startPos' | 'extraSeeds'> => {
  const start = isPrimary && startPos ? startPos : known[0];
  const extra = isPrimary && startPos ? known : known.slice(1);
  return {
    ...(start ? { startPos: start } : {}),
    ...(extra.length > 0 ? { extraSeeds: extra } : {}),
  };
};

export { seedOptions };
