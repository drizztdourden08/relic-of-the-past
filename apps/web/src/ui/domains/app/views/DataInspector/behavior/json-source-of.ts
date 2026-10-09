/* @layer renderer-app @kind logic */
import type { InspectorRow } from '../DataInspector.type';

const jsonSourceOf = (record: InspectorRow): string => JSON.stringify(record, null, 2);

export { jsonSourceOf };
