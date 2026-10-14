/* @layer renderer-hud @kind logic */
import { groundShape } from '@rotp/game-data';
import type { DialogCorner } from '@rotp/game-data';
import type { DialogBorderLook } from '../DialogBox.type';
import type { DialogLookInput } from './dialog-look.type';
import { featherStyle } from './feather-style';

const drawnBorderOf = (bordered: boolean, useTiles: boolean, kind: DialogBorderLook['kind']): 'single' | 'double' | null => {
  if (!bordered || useTiles || kind === 'none') return null;
  return kind === 'double' ? 'double' : 'single';
};

const groundInsetOf = (useTiles: boolean, feathered: boolean, tile: number): number => {
  if (useTiles) return Math.round(tile / 2);
  return feathered ? -tile : 0;
};

const groundCornerOf = (useTiles: boolean, bordered: boolean, corner: DialogCorner): DialogCorner => {
  if (useTiles) return 'square';
  return bordered ? corner : 'rounded';
};

const dialogLook = ({ bordered, border, tile, wantsFeather, tilesOk }: DialogLookInput) => {
  const useTiles = bordered && border.kind === 'original' && tilesOk;
  const drawn = drawnBorderOf(bordered, useTiles, border.kind);
  const feathered = wantsFeather && !useTiles && !drawn;
  const inset = groundInsetOf(useTiles, feathered, tile);
  const groundCorner = groundCornerOf(useTiles, bordered, border.corner);
  const shape = feathered ? featherStyle(2 * tile) : groundShape(groundCorner, bordered ? tile : Math.round(tile / 2));
  return { useTiles, drawn, inset, shape };
};

export { dialogLook };
