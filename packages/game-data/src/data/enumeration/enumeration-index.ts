/* @layer shared-game @kind logic */
import type { EnumerationCategory, EnumerationEntry } from '../types/enumeration';
import { ALL_ENUMERATION } from './enumeration.constants';

const groupByCategory = (entries: readonly EnumerationEntry[]): Map<EnumerationCategory, EnumerationEntry[]> => {
  const byCategory = new Map<EnumerationCategory, EnumerationEntry[]>();
  for (const entry of entries) {
    const list = byCategory.get(entry.category);
    if (list) list.push(entry);
    else byCategory.set(entry.category, [entry]);
  }
  return byCategory;
};

const enumerationIndex = {
  byCategory: groupByCategory(ALL_ENUMERATION),
  byId: new Map<string, EnumerationEntry>(ALL_ENUMERATION.map(entry => [entry.id, entry])),
  byCategoryAndValue: new Map<string, EnumerationEntry>(
    ALL_ENUMERATION.map(entry => [`${entry.category}:${entry.value}`, entry]),
  ),
};

export { enumerationIndex };
