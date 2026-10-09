/* @layer shared-game @kind logic */
import { capitalizeMarked, primary } from '../highlight-markup';
import { CLOSING } from './pond-demand-lines.constants';
import { demandCountOf } from './demand-count-of';
import { demandItemNameOf } from './demand-item-name-of';
import { demandLabelOf } from './demand-label-of';
import type { ShopPrice } from '../../world/shops/shop-price.type';
import type { ChoiceReceiptLine, ReceiptLine } from '../receipt-line.type';
import type { PondDemandLineSet, PondDemandPlace } from './pond-demand-lines.type';

const pronounOf = (demand: ShopPrice): string => (demandCountOf(demand) === 1 ? 'it' : 'them');

const promptOf = (demand: ShopPrice, label: string, it: string): readonly string[] => {
  if (demand.currency === 'item') return [`Show me ${label}?`, 'Will you show it?', 'Show it?'];
  if (demand.currency === 'bottle') return [`Will you throw ${it} in?`, `Throw ${it} in?`];
  return [`Throw in ${label}?`, `Will you throw ${it} in?`, `Throw ${it} in?`];
};

const askOf = (demand: ShopPrice, label: string): ChoiceReceiptLine => {
  const it = pronounOf(demand);
  const ask = demand.currency === 'item'
    ? [`The water holds a gift for you. Show it ${label} first. It goes straight back.`,
      `The water holds a gift for you. Show it ${label} first.`,
      `Show me ${label}. Throw it in, and I will give it back.`,
      `Show me ${label}.`, `${capitalizeMarked(label)}.`]
    : [`The water holds a gift for you. It asks for ${label} first. Throw ${it} in.`,
      `The water holds a gift for you. It asks for ${label}.`,
      `The water asks for ${label}. Will you throw ${it} in?`,
      `The water asks for ${label}.`, `${capitalizeMarked(label)}.`];
  return { ask, prompt: promptOf(demand, label, it), yes: `Throw ${it} in`, no: 'Not now' };
};

const refuseOf = (label: string): ReceiptLine => [
  `You do not have ${label}. Come back when you do.`,
  `Come back with ${label}.`,
  `${capitalizeMarked(label)}, first.`,
];

const awardOf = (demand: ShopPrice, label: string, place: PondDemandPlace): ReceiptLine | undefined => {
  const closing = place === 'wish' ? '' : ` ${CLOSING[place]}`;
  if (demand.currency === 'item') {
    return [`I give ${label} back to you, and a gift with it.${closing}`,
      `${capitalizeMarked(label)} goes back to you, with a gift.${closing}`,
      `${capitalizeMarked(label)} goes back, with a gift.`];
  }
  if (place !== 'wish') return undefined;
  return ['The water accepts your offering. This gift is yours.', 'The water accepts your offering.'];
};

const markedLabelOf = (demand: ShopPrice): string =>
  (demand.currency === 'item' ? `the ${primary(demandItemNameOf(demand.itemName))}` : primary(demandLabelOf(demand)));

const pondDemandLinesOf = (demand: ShopPrice, place: PondDemandPlace): PondDemandLineSet => {
  const label = markedLabelOf(demand);
  const award = awardOf(demand, label, place);
  return { ask: askOf(demand, label), refuse: refuseOf(label), ...(award === undefined ? {} : { award }) };
};

export { pondDemandLinesOf };
