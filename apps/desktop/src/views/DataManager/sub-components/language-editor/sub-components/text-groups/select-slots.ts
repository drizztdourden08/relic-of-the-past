/* @layer renderer-components @kind logic */
import { isTranslated } from './is-translated';
import type { TextGroup, TextSlot } from '@rotp/languages';
import type { SlotFilter } from './text-groups.type';

const matchesQuery = (slot: TextSlot, needle: string): boolean =>
  slot.label.toLowerCase().includes(needle)
  || slot.key.toLowerCase().includes(needle)
  || slot.fallback.toLowerCase().includes(needle);

const selectSlots = (
  group: TextGroup,
  values: Record<string, string>,
  filter: SlotFilter,
): TextSlot[] => {
  const needle = filter.query.trim().toLowerCase();

  return group.slots.filter((slot) => {
    if (needle.length > 0 && !matchesQuery(slot, needle)) return false;
    return !filter.untranslatedOnly || !isTranslated(slot, values);
  });
};

export { selectSlots };
