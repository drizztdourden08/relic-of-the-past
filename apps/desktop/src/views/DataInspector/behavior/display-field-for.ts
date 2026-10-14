/* @layer renderer-app @kind logic */
import type { FieldDescriptor } from '@drizztdourden08/tessera/data';
import { NAME_FIELD_BY_KIND } from '../DataInspector.constants';
import { asEntityKind } from './as-entity-kind';

const displayFieldFor = (field: FieldDescriptor | undefined): string | undefined => {
  if (field?.kind !== 'idRef') return undefined;
  const kind = asEntityKind(field.targetKind);
  return kind ? NAME_FIELD_BY_KIND[kind] : undefined;
};

export { displayFieldFor };
