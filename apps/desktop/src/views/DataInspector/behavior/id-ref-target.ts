/* @layer renderer-app @kind logic */
import type { IdRefTarget } from '../DataInspector.type';
import { asEntityKind } from './as-entity-kind';
import { entityKindFromId, resolveRecordLabel } from '@app/data-inspector/record-links';

const resolveIdRef = (
  idRef: string | undefined,
  targetKind: string | undefined,
): IdRefTarget | undefined => {
  const id = idRef?.trim();
  if (!id) return undefined;
  const kind = asEntityKind(targetKind) ?? entityKindFromId(id);
  if (!kind) return undefined;
  return { kind, id, label: resolveRecordLabel(id) };
};

export { resolveIdRef };
