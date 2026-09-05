/* @layer renderer-app @kind logic */
/**
 * Blank record for the create dialog: required fields seeded, optional ones
 * absent. Wraps the top-level fields as one object so `blankValue`
 * (`RecordEditor/behavior/array-elements.ts`) builds the whole record.
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
