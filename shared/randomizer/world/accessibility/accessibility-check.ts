/* @layer shared-game @kind logic */
import { isProgressionUnder } from '../pool/progression-class';
import { AUTO_ADVANCEMENT } from './accessibility-check.constants';
import type { AccessibilityInput } from './accessibility.type';
import type { ItemKey } from '../item-ids.data';
import type { CapacityProfile } from '../capacity/capacity-profile.type';

const advancementItemsOf = (capacity: CapacityProfile): ((item: ItemKey) => boolean) => {
  const isProgression = isProgressionUnder(capacity);
  return (item: ItemKey): boolean => AUTO_ADVANCEMENT.has(item) || isProgression(item);
};

const accessibilityFailures = (input: AccessibilityInput): string[] => {
  const { mode, capacity, uncollected, missedEvents, placedItems } = input;
  if (mode === 'minimal') return [];
  if (mode === 'full') return [...uncollected, ...missedEvents];
  const isAdvancement = advancementItemsOf(capacity);
  return [
    ...uncollected.filter((key) => {
      const item = placedItems.get(key);
      return item !== undefined && isAdvancement(item);
    }),
    ...missedEvents,
  ];
};

export { accessibilityFailures };
