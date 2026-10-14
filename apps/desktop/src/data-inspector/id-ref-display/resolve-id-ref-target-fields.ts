/* @layer renderer-app @kind logic */
import type { IdRefTargetField } from '@drizztdourden08/tessera/composites';
import { NO_TARGET_FIELDS } from '@app/views/DataInspector/DataInspector.constants';
import { asEntityKind } from '@app/views/DataInspector/behavior/as-entity-kind';
import { fieldsFor } from './fields-for';

const resolveIdRefTargetFields = (targetKind: string): readonly IdRefTargetField[] => {
  const kind = asEntityKind(targetKind);
  return kind ? fieldsFor(kind) : NO_TARGET_FIELDS;
};

export { resolveIdRefTargetFields };
