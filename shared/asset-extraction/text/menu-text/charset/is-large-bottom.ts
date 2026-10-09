/* @layer shared-asset-extraction @kind logic */
import { LARGE_BOTTOM_FIRST, LARGE_BOTTOM_LAST } from './charset.constants';

const isLargeBottom = (index: number): boolean =>
  index >= LARGE_BOTTOM_FIRST && index <= LARGE_BOTTOM_LAST;

export { isLargeBottom };
