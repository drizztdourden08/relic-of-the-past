/* @layer shared-game @kind logic */
import type { TileCat } from '../../data/types/tile-attrs-types';
import { tileAttrsFor } from './tile-attrs-for';

const isCategory = (attr: number, cat: TileCat, indoors = false): boolean => tileAttrsFor(indoors)[attr]?.cat === cat;

export { isCategory };
