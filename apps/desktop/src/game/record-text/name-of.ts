/* @layer renderer-app @kind logic */
import { recordText } from './record-text-of';
import type { NamedRecord, RecordKind } from './record-text.type';

const nameOf = (kind: RecordKind) => (record: NamedRecord): string => recordText(kind, record.id, record.name);

export { nameOf };
