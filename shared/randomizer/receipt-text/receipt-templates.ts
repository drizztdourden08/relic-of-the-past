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
 * the ones a class cannot speak for.
 */

import { capacityGrowthLine, capacityNextStepLine } from './capacity-rung-values';
import { foundCandidates } from './receipt-flavour';
import type { CapacityFamilyId } from '@shared/game/data/capacity-family.type';
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
  `Your ${slot.toLowerCase()} is better than it was.`;

/** 4: delivered from a check with no physical container. */
const renderDelivered = (source: string, label: string): ReceiptLine =>
  [`${label}, by way of ${source}. No chest required.`, `${label}, from ${source}.`, `${label}.`];

/** 5, online (multiworld): another player found this item for us. */
const renderOnline = (sender: string, item: string, world = 'their world'): string =>
  `${sender} turned up your ${item} over in ${world}.`;

/** 6: junk / trap. */
const renderJunk = (item: string): string =>
  `It is ${item}. The pool can be cruel.`;

/**
 * 7, fixed-jump capacity upgrade, the location's own line: the jump this
 * item performs. The capacity it climbs from is only known at grant time, so
 * the core swaps in the (jump, starting rung) line pre-rendered for it
 * (capacity-fixed-lines.ts); this is what shows when no such line exists.
 */
const renderCapacityJump = (family: CapacityFamilyId, jump: number): string =>
  capacityGrowthLine(family, jump);

/**
 * 8, progressive capacity upgrade, the location's own line: the jump is
 * the plan's next step, so the core swaps in the per-rung line at grant
 * time (capacity_progressive.c); this is what shows when it cannot.
 */
const renderCapacityNextStep = (family: CapacityFamilyId): string =>
  capacityNextStepLine(family);

export {
  renderCapacityJump, renderCapacityNextStep, renderDelivered, renderFoundItem, renderJunk, renderOnline,
  renderProgressive,
};
