/* @layer bridge-wasm @kind logic */
import { find, getScreenByGameId } from '@shared/game/data';
import type { ScreenRecord } from '@shared/game/data';

const interiorFor = (roomIndex: number, palace?: number): ScreenRecord | undefined => {
  if (palace !== undefined) {
    const exact = getScreenByGameId({ roomIndex, palaceIndex: palace });
    if (exact) return exact;
  }
  const candidates = find('screen', (s) => s.kind !== 'overworld' && s.gameId.roomIndex === roomIndex);
  return candidates.length === 1 ? candidates[0] : undefined;
};

export { interiorFor };
