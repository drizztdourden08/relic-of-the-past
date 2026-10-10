/* @layer shared-asset-extraction @kind logic */
import { itemAt } from '../../checked-read';
import {
  ENTRANCE_POS_PER_CELL, EXTRA_ENTRANCE_ID, POS_DELTA, PYRAMID_AREA, PYRAMID_HOLE_CELL,
} from './second-cartridge-links.constants';

const appendExtraOverworldEntrance = (area: number[], pos: number[], id: number[]): void => {
  const source = pos.findIndex((p, i) => p === PYRAMID_HOLE_CELL * ENTRANCE_POS_PER_CELL && area[i] === PYRAMID_AREA);
  if (source < 0) {
    throw new Error(`No overworld entrance at the Pyramid opening (area 0x${PYRAMID_AREA.toString(16)}, cell ${PYRAMID_HOLE_CELL})`);
  }
  area.push(PYRAMID_AREA);
  pos.push(itemAt(pos, source, 'Pyramid entrance position') + POS_DELTA);
  id.push(EXTRA_ENTRANCE_ID);
};

export { appendExtraOverworldEntrance };
