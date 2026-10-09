/* @layer shared-game @kind logic */
import { find } from '../../../data';
import type { ScreenRecord } from '../../../data';

let cachedByIndex: Map<number, ScreenRecord> | null = null;

const screenByIndex = (): Map<number, ScreenRecord> => {
  if (!cachedByIndex) {
    cachedByIndex = new Map(
      find('screen', s => s.kind === 'overworld' && s.gameId.overworldIndex !== undefined)
        .map(s => [s.gameId.overworldIndex!, s]),
    );
  }
  return cachedByIndex;
};

export { screenByIndex };
