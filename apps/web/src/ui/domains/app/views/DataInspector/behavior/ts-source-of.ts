/* @layer renderer-app @kind logic */
import { EMIT_FAILED, NO_SERIALIZER } from '../DataInspector.constants';
import type { InspectorRow, InspectorSource } from '../DataInspector.type';

const tsSourceOf = (source: InspectorSource, record: InspectorRow): string => {
  if (!source.serialize) return NO_SERIALIZER;
  try {
    return source.serialize(record);
  } catch (error: unknown) {
    return `// ${EMIT_FAILED}: ${error instanceof Error ? error.message : String(error)}`;
  }
};

export { tsSourceOf };
