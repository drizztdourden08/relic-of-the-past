/* @layer test @kind helper */
import { all } from '@shared/game/data';
import type { ScreenRecord } from '@shared/game/data';

const overworldScreen = (): ScreenRecord => {
  const screen = all('screen').find(s => s.kind === 'overworld' && s.gameId.overworldIndex != null);
  if (!screen) throw new Error('dataset has no overworld screen');
  return screen;
};

export { overworldScreen };
