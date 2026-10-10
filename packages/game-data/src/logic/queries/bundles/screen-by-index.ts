/* @layer shared-game @kind logic */
import { all } from '../../../data';
import type { ScreenRecord } from '../../../data';

let cachedByIndex: Map<number, ScreenRecord> | null = null;

const indexedEntry = (screen: ScreenRecord): [number, ScreenRecord][] => {
  const index = screen.gameId.overworldIndex;
  return screen.kind === 'overworld' && index !== undefined ? [[index, screen]] : [];
};

const screenByIndex = (): Map<number, ScreenRecord> => {
  cachedByIndex ??= new Map(all('screen').flatMap(indexedEntry));
  return cachedByIndex;
};

export { screenByIndex };
