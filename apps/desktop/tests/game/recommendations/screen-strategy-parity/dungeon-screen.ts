/* @layer test @kind helper */
import { all } from '@rotp/game-data';
import type { ScreenRecord } from '@rotp/game-data';

const dungeonScreen = (exclude?: string): ScreenRecord => {
  const screen = all('screen').find(s =>
    s.kind === 'dungeon' && s.gameId.roomIndex != null && s.gameId.palaceIndex != null && s.id !== exclude);
  if (!screen) throw new Error('dataset has no dungeon screen with both native values');
  return screen;
};

export { dungeonScreen };
