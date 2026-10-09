/* @layer renderer-app @kind logic */
import type { IdRefTargetField } from '@ds/composites/DataTable';
import { NO_TARGET_FIELDS } from '../../DataInspector.constants';
import { asEntityKind } from '../as-entity-kind';
import { fieldsFor } from './fields-for';

const resolveIdRefTargetFields = (targetKind: string): readonly IdRefTargetField[] => {
  const kind = asEntityKind(targetKind);
  return kind ? fieldsFor(kind) : NO_TARGET_FIELDS;
};

export { resolveIdRefTargetFields };
