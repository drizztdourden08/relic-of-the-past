/* @layer shared-asset-extraction @kind logic */
import { LARGE_TOP_FIRST, LARGE_TOP_LAST } from './charset.constants';

const isLargeTop = (index: number): boolean => index >= LARGE_TOP_FIRST && index <= LARGE_TOP_LAST;

export { isLargeTop };
