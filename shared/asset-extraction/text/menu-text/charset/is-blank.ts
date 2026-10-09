/* @layer shared-asset-extraction @kind logic */
import { BLANK_INDEX } from './charset.constants';

const isBlank = (index: number): boolean => index === BLANK_INDEX;

export { isBlank };
