/* @layer shared-game @kind logic */
import { foundCandidates } from '../receipt-flavour';
import type { FlavourParams } from '../receipt-flavour';
import type { ReceiptLine } from '../receipt-line.type';

const renderFoundItem = (params: FlavourParams): ReceiptLine => foundCandidates(params);

export { renderFoundItem };
