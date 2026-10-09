/* @layer bridge-wasm @kind logic */
import type { GridPos } from '@shared/game/navigation';
import { REGION_SHIFT } from './screen-resolve.constants';

const regionQualifier = (tile?: GridPos): string =>
  tile ? `@${tile.row >> REGION_SHIFT},${tile.col >> REGION_SHIFT}` : '';

export { regionQualifier };
