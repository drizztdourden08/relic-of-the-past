/* @layer renderer-app @kind logic */
import { recordText } from './record-text-of';
import type { NamedRecord, RecordKind } from './record-text.type';

const nameOf = (kind: RecordKind) => (record: NamedRecord): string => recordText(kind, record.id, 'name', record.name);

const checkName = nameOf('check');
const screenName = nameOf('screen');
const itemName = nameOf('item');
const placeName = nameOf('place');

const checkNote = (record: NamedRecord & { note?: string }): string | undefined =>
  record.note === undefined ? undefined : recordText('check', record.id, 'note', record.note);

const recordNameMatches = (kind: RecordKind, record: NamedRecord, query: string): boolean => {
  const needle = query.trim().toLowerCase();
  return needle === '' || record.name.toLowerCase().includes(needle) || recordText(kind, record.id, 'name', record.name).toLowerCase().includes(needle);
};

export { checkName, checkNote, itemName, placeName, recordNameMatches, screenName };
