/* @layer shared-game @kind logic */
/**
 * The three lines a pond speaks for a rung that asks for something, at any of
 * the three ponds (core/game-hooks/pond_demand_visit.c):
 *
 *   the ask:    a yes/no box naming the demand: "150 rupees", "5 bombs",
 *               "a bottle of Red Potion", "3 Bees in bottles", "the Hookshot".
 *               An item is only shown, so she asks for it to be thrown in as
 *               proof;
 *   the refuse: a yes from a player who cannot pay: what she wants, and to
 *               come back with it;
 *   the award:  what she says when she rises with the gift. An item goes
 *               back with it, and she says so. The rupee pond also says
 *               whether the water still holds more, the way its own award
 *               line does; a paid demand at a wish pond thanks the offering
 *               in place of the line a free rung speaks.
 *
 * Counted amounts reuse the shop's own price labels. Candidates run fullest
 * first, so the composer keeps the longer wording when the box has room
 * (receipt-line.type.ts). Pure: nothing here knows about message ids.
 */
import { priceLabelOf } from '../ap-world/shops/shop-price-native';
import type { ShopBottleContent, ShopBottlePrice, ShopPrice } from '../ap-world/shops/shop-price.type';
import type { ChoiceReceiptLine, ReceiptLine } from './receipt-line.type';

/** Where a rung stands, for the award line's closing clause. */
type PondDemandPlace = 'wish' | 'more' | 'last';

interface PondDemandLineSet {
  ask: ChoiceReceiptLine;
  refuse: ReceiptLine;
  /** Absent when the pond's own award line already fits. */
  award?: ReceiptLine;
}

const BOTTLE_NAMES: Readonly<Record<ShopBottleContent, string>> = {
  'red-potion': 'Red Potion', 'green-potion': 'Green Potion', 'blue-potion': 'Blue Potion', fairy: 'Fairy', bee: 'Bee',
};

/** What several of a bottled creature are called; a potion reads the same however many. */
const BOTTLE_PLURALS: Readonly<Record<ShopBottleContent, string>> = {
  'red-potion': 'Red Potion', 'green-potion': 'Green Potion', 'blue-potion': 'Blue Potion',
  fairy: 'Fairies', bee: 'Bees',
};

const POTIONS: ReadonlySet<ShopBottleContent> = new Set(['red-potion', 'green-potion', 'blue-potion']);

/** "the Hookshot"; a progressive family names the thing itself, "the Sword". */
const itemLabelOf = (itemName: string): string => `the ${itemName.replace(/^Progressive /, '')}`;

/** The label as its own sentence opens, for the terse wording that has to fit one box row. */
const capitalized = (label: string): string => `${label.charAt(0).toUpperCase()}${label.slice(1)}`;

/** How many of the thing a demand asks for; one for the kinds that count nothing. */
const countOf = (demand: ShopPrice): number => (demand.currency === 'item' ? 1 : demand.amount ?? 1);

/** "a bottle of Red Potion", "a Fairy in a bottle", "3 bottles of Red Potion", "3 Bees in bottles". */
const bottleLabelOf = (demand: ShopBottlePrice): string => {
  const potion = POTIONS.has(demand.content);
  const count = countOf(demand);
  if (count === 1) {
    const one = BOTTLE_NAMES[demand.content];
    return potion ? `a bottle of ${one}` : `a ${one} in a bottle`;
  }
  const many = BOTTLE_PLURALS[demand.content];
  return potion ? `${count} bottles of ${many}` : `${count} ${many} in bottles`;
};

/** What the demand is called in her lines. */
const demandLabelOf = (demand: ShopPrice): string => {
  if (demand.currency === 'item') return itemLabelOf(demand.itemName);
  if (demand.currency === 'bottle') return bottleLabelOf(demand);
  const label = priceLabelOf(demand);
  // "1 bombs" reads wrong in a line she speaks, and the shared price label only singularises
  // hearts, because a shelf shows its price as digits beside a picture and never says it.
  return demand.amount === 1 ? label.replace(/s$/, '') : label;
};

/** One of a thing is "it", several of it are "them". */
const pronounOf = (demand: ShopPrice): string => (countOf(demand) === 1 ? 'it' : 'them');

/**
 * What she says, fullest wording first. The composer keeps the fullest one the box can page
 * (choice-message.ts): she speaks it, the player clears it with a key, and the answers come up
 * under |prompt| on the page after. The terse last rungs are the fallback for a label so long
 * that nothing fuller fits three rows, and every rung still names what she wants.
 */
const askOf = (demand: ShopPrice, label: string): ChoiceReceiptLine => {
  const it = pronounOf(demand);
  const ask = demand.currency === 'item'
    ? [`The water holds a gift for you. Show it ${label} first. It goes straight back.`,
      `The water holds a gift for you. Show it ${label} first.`,
      `Show me ${label}. Throw it in, and I will give it back.`,
      `Show me ${label}.`, `${capitalized(label)}.`]
    : [`The water holds a gift for you. It asks for ${label} first. Throw ${it} in.`,
      `The water holds a gift for you. It asks for ${label}.`,
      `The water asks for ${label}. Will you throw ${it} in?`,
      `The water asks for ${label}.`, `${capitalized(label)}.`];
  // The bottle label already ends in "in bottles", so naming it again here reads badly; page
  // one carries the demand for every kind, so the prompt may fall back to the pronoun.
  const prompt = demand.currency === 'item' ? [`Show me ${label}?`, 'Will you show it?', 'Show it?']
    : demand.currency === 'bottle' ? [`Will you throw ${it} in?`, `Throw ${it} in?`]
      : [`Throw in ${label}?`, `Will you throw ${it} in?`, `Throw ${it} in?`];
  return { ask, prompt, yes: `Throw ${it} in`, no: 'Not now' };
};

const refuseOf = (label: string): ReceiptLine => [
  `You do not have ${label}. Come back when you do.`,
  `Come back with ${label}.`,
  `${capitalized(label)}, first.`,
];

const CLOSING: Readonly<Record<Exclude<PondDemandPlace, 'wish'>, string>> = {
  more: 'The water holds more.',
  last: 'The water is empty now.',
};

const awardOf = (demand: ShopPrice, label: string, place: PondDemandPlace): ReceiptLine | undefined => {
  const closing = place === 'wish' ? '' : ` ${CLOSING[place]}`;
  if (demand.currency === 'item') {
    return [`I give ${label} back to you, and a gift with it.${closing}`,
      `${capitalized(label)} goes back to you, with a gift.${closing}`,
      `${capitalized(label)} goes back, with a gift.`];
  }
  if (place !== 'wish') return undefined;
  return ['The water accepts your offering. This gift is yours.', 'The water accepts your offering.'];
};

const pondDemandLinesOf = (demand: ShopPrice, place: PondDemandPlace): PondDemandLineSet => {
  const label = demandLabelOf(demand);
  const award = awardOf(demand, label, place);
  return { ask: askOf(demand, label), refuse: refuseOf(label), ...(award === undefined ? {} : { award }) };
};

export { demandLabelOf, pondDemandLinesOf };
export type { PondDemandLineSet, PondDemandPlace };
