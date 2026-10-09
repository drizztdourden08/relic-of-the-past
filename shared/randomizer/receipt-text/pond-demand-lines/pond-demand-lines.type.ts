/* @layer shared-game @kind types */
import type { ChoiceReceiptLine, ReceiptLine } from '../receipt-line.type';

type PondDemandPlace = 'wish' | 'more' | 'last';

interface PondDemandLineSet {
  ask: ChoiceReceiptLine;
  refuse: ReceiptLine;
  award?: ReceiptLine;
}

export type { PondDemandLineSet, PondDemandPlace };
