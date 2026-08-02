/* @layer renderer-app @kind logic */
/**
 * The two read-only renderings of a record.
 *
 * The source form is the dataset's own emitter, so what the tab shows is
 * exactly the text a save would write — not a second stringifier that could
 * drift from it. That emitter refuses a record carrying a field it does not
 * know, and refusing loudly is the point: the failure is shown in the panel as
 * a comment rather than blanking the tab or taking the screen down with it.
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
