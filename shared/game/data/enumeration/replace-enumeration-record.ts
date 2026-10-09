/* @layer shared-game @kind logic */
import { replaceAll } from '../registry';
import type { EnumerationEntry } from '../types/enumeration';
import { ALL_ENUMERATION } from './enumeration.constants';
import { enumerationIndex } from './enumeration-index';

const moveBetweenCategories = (existing: EnumerationEntry, record: EnumerationEntry): void => {
  const { byCategory } = enumerationIndex;
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
};

const replaceEnumerationRecord = (record: EnumerationEntry): boolean => {
  const { byId, byCategoryAndValue } = enumerationIndex;
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
  moveBetweenCategories(existing, record);
  replaceAll('enumeration', ALL_ENUMERATION);
  return true;
};

export { replaceEnumerationRecord };
