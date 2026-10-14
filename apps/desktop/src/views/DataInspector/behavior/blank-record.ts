/* @layer renderer-app @kind logic */
import { blankValue } from '@drizztdourden08/tessera/data';
import type { FieldDescriptor } from '@drizztdourden08/tessera/data';

const blankRecordFor = (schema: readonly FieldDescriptor[]): Record<string, unknown> => {
  const root: FieldDescriptor = {
    path: '', label: '', kind: 'object', optional: false, children: schema,
  };
  return blankValue(root) as Record<string, unknown>;
};

export { blankRecordFor };
