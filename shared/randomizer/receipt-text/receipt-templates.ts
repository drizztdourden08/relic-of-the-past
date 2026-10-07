/* @layer shared-game @kind logic */
/**
 * Contextual receipt-message templates: one pure renderer per situation from
 * the receipt-graphics plan. Every placeholder is filled from real data (the
 * frozen placement, the check dataset, the network session); the template text
 * itself stays name-free and restricted to the game alphabet's shared
 * punctuation (letters, digits, space and .,!?-'"()>; the colon the capacity
 * lines carry is mapped to " -" by the composer for the alphabets that lack
 * one). A line that names its source hands the composer candidates, fullest
 * first, so a long location name costs the flavour and then the source, never
 * the numbers (receipt-line.type.ts). The found line's wording is per item
 * class and per set position (receipt-flavour.ts); the situations below are
 * the ones a class cannot speak for. Item names carry the primary highlight
 * and player names the secondary one (highlight-markup.ts). A capacity
 * upgrade has no situation of its own: it takes the line of its context, and
 * its climb follows as a second page (capacity-rung-values.ts).
 */

import { primary, secondary } from './highlight-markup';
import { foundCandidates } from './receipt-flavour';
import type { FlavourParams } from './receipt-flavour';
import type { ReceiptLine } from './receipt-line.type';

/** 1, found item (local seed): a chest or giver hands over a shuffled item. */
const renderFoundItem = (params: FlavourParams): ReceiptLine => foundCandidates(params);

/**
 * 2, progressive tier with no seed to count from (an online receipt): the
 * tier is decided by the core from live inventory the moment the grant fires
 * (progressive-receive-id contract), so this line carries no number. The slot
 * is the whole subject, so naming the item too would only say it twice.
 */
const renderProgressive = (slot: string): string =>
  `Your ${primary(slot.toLowerCase())} is better than it was.`;

/** 4: delivered from a check with no physical container. */
const renderDelivered = (source: string, label: string): ReceiptLine =>
  [`${label}, by way of ${source}. No chest required.`, `${label}, from ${source}.`, `${label}.`];

/** 5, online (multiworld): another player found this item for us. */
const renderOnline = (sender: string, item: string, world = 'their world'): string =>
  `${secondary(sender)} turned up your ${primary(item)} over in ${world}.`;

/** 5b, online: the server itself sent this item (a command, the starting inventory). */
const renderFromServer = (item: string): string => `The server sent you ${primary(item)}!`;

/** 6: junk / trap. */
const renderJunk = (item: string): string =>
  `It is ${primary(item)}. The pool can be cruel.`;

export { renderDelivered, renderFoundItem, renderFromServer, renderJunk, renderOnline, renderProgressive };
