/* @layer renderer-app @kind logic */
/**
 * The domain half of the id-reference handoff.
 *
 * `id-ref-kit` publishes `data-id-ref` / `data-target-kind` on the cell it
 * renders and deliberately stops there — the design system has no business
 * knowing which collections exist. Turning those two strings back into a
 * collection and a display name is this screen's job, which is why it lives
 * here and takes only the attribute values: no element, no DOM, so it is
 * exactly as testable as it is reusable.
 */
import { ENTITY_KINDS } from '../DataInspector.constants';
import { entityKindFromId, resolveRecordLabel } from './record-links';
import type { EntityKind } from '@shared/game/data';
import type { IdRefTarget } from '../DataInspector.type';

const asEntityKind = (value: string | undefined): EntityKind | undefined =>
  ENTITY_KINDS.find(kind => kind === value);

/**
 * The published target kind wins when it names a real collection, because a
 * field descriptor saw every value in the column; the id's own prefix is the
 * fallback for a reference rendered without one.
 */
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
