/* @layer shared-game @kind logic */
import type { AnyRecord } from './session-records.type';

const idOf = (record: unknown): string => (record as AnyRecord).id;

export { idOf };
