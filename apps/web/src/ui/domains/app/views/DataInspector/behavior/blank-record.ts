/* @layer renderer-app @kind logic */
/**
 * A blank starting record for the create dialog, shaped by the collection's
 * own schema: every required field seeded, every optional one left absent.
 *
 * `blankValue` already applies exactly that rule recursively to one array
 * element's shape (see `RecordEditor/behavior/array-elements.ts`); this only
 * wraps the schema's top-level fields as if they were one object's children,
 * so the same rule builds a whole record instead of one element.
 */
import { blankValue } from '@ds/composites/RecordEditor';
import type { FieldDescriptor } from '@ds/data';

const blankRecordFor = (schema: readonly FieldDescriptor[]): Record<string, unknown> => {
  const root: FieldDescriptor = {
    path: '', label: '', kind: 'object', optional: false, children: schema,
  };
  return blankValue(root) as Record<string, unknown>;
};

export { blankRecordFor };
