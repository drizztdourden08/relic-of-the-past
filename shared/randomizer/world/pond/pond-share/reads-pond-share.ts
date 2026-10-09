/* @layer shared-game @kind logic */
import { POND_SHARE_KEY } from './pond-share.constants';
import type { PartialOptionValues } from '../../options.type';

const readsPondShare = (values: PartialOptionValues): boolean => values[POND_SHARE_KEY] === true;

export { readsPondShare };
