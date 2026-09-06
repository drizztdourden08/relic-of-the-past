/* @layer renderer-app @kind logic */
/**
 * `id-ref-kit` publishes `data-id-ref` / `data-target-kind` on the cell and
 * stops there; turning them back into a collection and a display name is this
 * screen's job. Takes only the attribute values, no DOM.
 */
import { ENTITY_KINDS } from '../DataInspector.constants';
import { entityKindFromId, resolveRecordLabel } from './record-links';
import type { EntityKind } from '@shared/game/data';
import type { IdRefTarget } from '../DataInspector.type';

const asEntityKind = (value: string | undefined): EntityKind | undefined =>
  ENTITY_KINDS.find(kind => kind === value);

/** The published target kind wins when it names a real collection; the id's prefix is the fallback. */
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
