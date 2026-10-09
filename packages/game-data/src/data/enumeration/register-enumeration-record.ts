/* @layer shared-game @kind logic */
import { replaceAll } from '../registry';
import type { EnumerationEntry } from '../types/enumeration';
import { ALL_ENUMERATION } from './enumeration.constants';
import { enumerationIndex } from './enumeration-index';

const registerEnumerationRecord = (record: EnumerationEntry): boolean => {
  const { byId, byCategoryAndValue, byCategory } = enumerationIndex;
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

export { registerEnumerationRecord };
