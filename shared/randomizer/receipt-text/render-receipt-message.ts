/* @layer shared-game @kind logic */
/**
 * Receipt message routing: picks the contextual template for one planned
 * grant and renders its final line. A grant the seed can count (a palace's
 * keys, a heart piece, a bottle, a progressive tier, a prize) takes the
 * found-item line with its numbered label AND its class's own wording, so the
 * numbers always show and never in the same sentence twice over. Otherwise
 * physical grants (chest / scripted-giver overrides) are routed by item class:
 * progressive, dungeon item, capacity, junk, or the plain found line. Queue
 * deliveries always take the delivered template, since the missing container is the
 * salient context there. Online receipts are rendered separately (renderOnline)
 * because their sender is only known at network time.
 */

import { classifyReceiptItem } from './receipt-item-class';
import { flavourKeyOf } from './receipt-flavour';
import { numberedItemLabel } from './numbered-item-label';
import {
  renderCapacityJump, renderCapacityNextStep, renderDelivered, renderFoundItem, renderJunk, renderProgressive,
} from './receipt-templates';
import type { ReceiptCount } from './receipt-counts';
import type { ReceiptLine } from './receipt-line.type';

/** The plan classes a pre-rendered line exists for (vanilla-locked has none). */
type ReceiptGrantKind = 'physical' | 'delivered';

interface ReceiptMessageParams {
  kind: ReceiptGrantKind;
  /** Community-standard item name from the placement. */
  itemName: string;
  /** Community-standard location (check) name: the {source} placeholder. */
  locationName: string;
  /** The seed's found/total numbers for this location; absent = uncounted (or no seed). */
  count?: ReceiptCount;
}

const renderReceiptMessage = (params: ReceiptMessageParams): ReceiptLine => {
  const { kind, itemName, locationName, count } = params;
  const label = numberedItemLabel(itemName, count);
  if (kind === 'delivered') return renderDelivered(locationName, label);
  const itemClass = classifyReceiptItem(itemName);
  const found = (): ReceiptLine => renderFoundItem({
    key: flavourKeyOf(itemName, itemClass.kind === 'dungeon-item'),
    label,
    source: locationName,
    count,
  });
  if (count !== undefined) return found();
  switch (itemClass.kind) {
    case 'progressive':
      return renderProgressive(itemClass.slot);
    case 'capacity':
      return renderCapacityJump(itemClass.family, itemClass.jump);
    case 'capacity-progressive':
      return renderCapacityNextStep(itemClass.family);
    case 'junk':
      return renderJunk(itemName);
    case 'dungeon-item':
    case 'standard':
      return found();
  }
};

export { renderReceiptMessage };
export type { ReceiptGrantKind, ReceiptMessageParams };
