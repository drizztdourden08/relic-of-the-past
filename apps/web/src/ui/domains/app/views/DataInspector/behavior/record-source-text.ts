/* @layer renderer-app @kind logic */
/**
 * The two read-only renderings of a record. The source form uses the dataset's
 * own emitter, so the tab shows exactly what a save would write. The emitter
 * refuses unknown fields; that failure is shown in the panel as a comment.
 */
import type { InspectorRow, InspectorSource } from '../DataInspector.type';

const NO_SERIALIZER = '// This collection has no source emitter.';
const FAILED = 'could not be emitted';

const jsonSourceOf = (record: InspectorRow): string => JSON.stringify(record, null, 2);

const tsSourceOf = (source: InspectorSource, record: InspectorRow): string => {
  if (!source.serialize) return NO_SERIALIZER;
  try {
    return source.serialize(record);
  } catch (error: unknown) {
    return `// ${FAILED}: ${error instanceof Error ? error.message : String(error)}`;
  }
};

export { jsonSourceOf, tsSourceOf };
