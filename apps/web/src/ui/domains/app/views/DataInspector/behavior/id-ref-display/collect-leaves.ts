/* @layer renderer-app @kind logic */
import type { FieldDescriptor } from '@ds/data';
import type { IdRefTargetField } from '@ds/composites/DataTable';
import { CONTAINER_KINDS } from '../../DataInspector.constants';

const collectLeaves = (
  fields: readonly FieldDescriptor[],
  into: IdRefTargetField[],
): IdRefTargetField[] => {
  for (const field of fields) {
    if (field.children) collectLeaves(field.children, into);
    else if (!CONTAINER_KINDS.includes(field.kind)) into.push({ path: field.path, label: field.label });
  }
  return into;
};

export { collectLeaves };
