/* @layer renderer-app @kind logic */
import type { InspectorRow } from '../DataInspector.type';

const draftOf = <T extends object>(draft: InspectorRow): T => draft as T;

export { draftOf };
