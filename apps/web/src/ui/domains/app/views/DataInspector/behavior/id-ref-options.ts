/* @layer renderer-app @kind logic */
import type { FieldDescriptor } from '@ds/data';
import { IDENTITY_PATH } from '@ds/composites/RecordEditor';
import type { IdRefOption } from '@ds/composites/RecordEditor';
import { NARROWED_KIND, NO_OPTIONS } from '../DataInspector.constants';
import { areaIdOf } from './area-id-of';
import { asEntityKind } from './as-entity-kind';
import { optionsFor } from './options-for';
import { optionsInArea } from './options-in-area';

const resolveIdRefOptionsFor = (
  targetKind: string,
  field: FieldDescriptor,
  record?: unknown,
): readonly IdRefOption[] => {
  if (field.path === IDENTITY_PATH) return NO_OPTIONS;
  const kind = asEntityKind(targetKind);
  if (!kind) return NO_OPTIONS;
  if (kind !== NARROWED_KIND) return optionsFor(kind);
  const areaId = areaIdOf(record);
  return areaId === undefined ? optionsFor(kind) : optionsInArea(kind, areaId);
};

export { resolveIdRefOptionsFor };
