/* @layer shared-game @kind logic */
import { FLAVOUR_BUILDERS } from './receipt-flavour.constants';
import type { FlavourParams } from './receipt-flavour.type';

const foundCandidates = (params: FlavourParams): readonly string[] => FLAVOUR_BUILDERS[params.key](params);

export { foundCandidates };
