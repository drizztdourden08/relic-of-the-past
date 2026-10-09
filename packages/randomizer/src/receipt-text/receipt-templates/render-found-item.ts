/* @layer shared-game @kind logic */
import { foundCandidates } from '../receipt-flavour';
import type { FlavourParams } from '../receipt-flavour';
import type { ReceiptLine } from '@rotp/game-core';

const renderFoundItem = (params: FlavourParams): ReceiptLine => foundCandidates(params);

export { renderFoundItem };
