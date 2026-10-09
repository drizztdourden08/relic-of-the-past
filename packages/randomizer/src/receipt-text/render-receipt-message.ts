/* @layer shared-game @kind logic */
import { classifyReceiptItem } from './receipt-item-class';
import { flavourKeyOf } from './receipt-flavour';
import { numberedItemLabel } from './numbered-item-label';
import { renderDelivered, renderFoundItem, renderJunk, renderProgressive } from './receipt-templates';
import type { ReceiptLine } from '@rotp/game-core';
import type { ReceiptMessageParams } from './render-receipt-message.type';

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
    case 'junk':
      return renderJunk(itemName);
    case 'capacity':
    case 'capacity-progressive':
    case 'dungeon-item':
    case 'standard':
      return found();
  }
};

export { renderReceiptMessage };
