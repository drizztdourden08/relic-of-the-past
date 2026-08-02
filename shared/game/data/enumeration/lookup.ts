/* @layer shared-game @kind logic */
import { replaceAll } from '../registry';
import { ALL_ENUMERATION } from './enumeration';
import type { EnumerationCategory, EnumerationEntry } from '../types/enumeration';

const byCategory = new Map<EnumerationCategory, EnumerationEntry[]>();
for (const entry of ALL_ENUMERATION) {
  const list = byCategory.get(entry.category);
  if (list) list.push(entry);
  else byCategory.set(entry.category, [entry]);
}

const byId = new Map<string, EnumerationEntry>(ALL_ENUMERATION.map(entry => [entry.id, entry]));

const byCategoryAndValue = new Map<string, EnumerationEntry>(
  ALL_ENUMERATION.map(entry => [`${entry.category}:${entry.value}`, entry]),
);

/** Every row seeded for one category, in seed order. */
const enumerationFor = (category: EnumerationCategory): readonly EnumerationEntry[] => byCategory.get(category) ?? [];

/** The human label for one category/value pair, or undefined when nothing was seeded for it. */
const labelOf = (category: EnumerationCategory, value: string): string | undefined =>
  byCategoryAndValue.get(`${category}:${value}`)?.label;

/**
 * Adds an entry the allocator minted after seeding, so the session answers for
 * it without a reload — the same bargain `registerTag`/`registerItemGroupRecord`
 * make on their own collections. Ignored when the id is already registered,
 * which a genuinely new allocation never is.
 */
const registerEnumerationRecord = (record: EnumerationEntry): boolean => {
  if (byId.has(record.id)) return false;
  ALL_ENUMERATION.push(record);
  byId.set(record.id, record);
  byCategoryAndValue.set(`${record.category}:${record.value}`, record);
  const list = byCategory.get(record.category);
  if (list) list.push(record);
  else byCategory.set(record.category, [record]);
  replaceAll('enumeration', ALL_ENUMERATION);
  return true;
};

/**
 * Folds an edited record back in once its write has already landed on disk, so
 * a relabel resolves in the session without a reload — the same bargain
 * `replaceItemGroupRecord`/`replaceTagRecord` make on their own collections.
 * The category/value pair can change along with the label, so the old
 * `byCategoryAndValue` entry is dropped rather than left to shadow the new one.
 */
const replaceEnumerationRecord = (record: EnumerationEntry): boolean => {
  const existing = byId.get(record.id);
  if (!existing) return false;
  const index = ALL_ENUMERATION.findIndex(entry => entry.id === record.id);
  if (index === -1) return false;
  ALL_ENUMERATION[index] = record;
  byId.set(record.id, record);
  const oldKey = `${existing.category}:${existing.value}`;
  const newKey = `${record.category}:${record.value}`;
  if (oldKey !== newKey) byCategoryAndValue.delete(oldKey);
  byCategoryAndValue.set(newKey, record);
  const oldList = byCategory.get(existing.category);
  if (oldList && existing.category !== record.category) {
    const at = oldList.indexOf(existing);
    if (at >= 0) oldList.splice(at, 1);
  }
  const newList = byCategory.get(record.category);
  if (newList) {
    const at = newList.findIndex(entry => entry.id === record.id);
    if (at >= 0) newList[at] = record;
    else newList.push(record);
  } else {
    byCategory.set(record.category, [record]);
  }
  replaceAll('enumeration', ALL_ENUMERATION);
  return true;
};

export { enumerationFor, labelOf, registerEnumerationRecord, replaceEnumerationRecord };
