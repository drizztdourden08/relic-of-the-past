import type { GameSettings } from '@shared/types/settings';

export const getGameRatio = (aspectRatio: GameSettings['aspectRatio']): number => {
  const canvas = document.querySelector('.game-layer__canvas') as HTMLCanvasElement | null;
  if (canvas && canvas.width > 0 && canvas.height > 0) {
    return canvas.width / canvas.height;
  }
  switch (aspectRatio) {
    case '16:9':  return 16 / 9;
    case '16:10': return 16 / 10;
    case '18:9':  return 18 / 9;
    case '3:2':   return 3 / 2;
    case '4:3':
    default:      return 4 / 3;
  }
};
