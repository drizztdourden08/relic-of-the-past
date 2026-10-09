/* @layer shared-game @kind logic */
import type { RoomContext } from './tile-classification.type';
import { NOT_IN_PALACE_X2 } from './tile-classification.constants';

const resolveRoomContext = (indoors: boolean, rawPalaceIndexX2: number): RoomContext => ({
  indoors,
  palaceIndex: rawPalaceIndexX2 === NOT_IN_PALACE_X2 ? null : rawPalaceIndexX2 >> 1,
});

export { resolveRoomContext };
