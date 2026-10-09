/* @layer shared-game @kind logic */
import type { TileReq } from '@rotp/game-data';
import { tileAttrsFor } from './tile-attrs-for';

const getAttrReq = (attr: number, indoors = false): TileReq | undefined => tileAttrsFor(indoors)[attr]?.req;

export { getAttrReq };
