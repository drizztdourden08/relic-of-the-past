/* @layer renderer-app @kind logic */
import { recordText } from './record-text-of';
import type { NamedRecord, RecordKind } from './record-text.type';

const recordNameMatches = (kind: RecordKind, record: NamedRecord, query: string): boolean => {
  const needle = query.trim().toLowerCase();
  return needle === '' || record.name.toLowerCase().includes(needle) || recordText(kind, record.id, record.name).toLowerCase().includes(needle);
};

export { recordNameMatches };
