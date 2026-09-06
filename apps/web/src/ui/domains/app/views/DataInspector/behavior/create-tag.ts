/* @layer renderer-app @kind logic */
/**
 * Minting a vocabulary term from the editor. The main process validates,
 * allocates the id and appends the record; the result is folded into the
 * in-memory collection so the chip resolves at once. The key convention is
 * also checked locally to save an IPC round trip, but the writer's check is
 * the one that counts. Failures return their reason, never a bare null.
 */
import { isTagKey, registerTag } from '@shared/game/data';
import { registerIdRefOption } from './id-ref-options';
import { invalidateTagSuggestions } from './tag-suggestions';
import { resolveRecordLabel } from './record-links';
import { ENTITY_KINDS } from '../DataInspector.constants';
import type { EntityKind } from '@shared/game/data';
import type { TagCreateResult, TagCreator } from '@ds/composites/RecordEditor';

const creators = new Map<string, TagCreator>();

const NOT_CONVENTION = 'Tags must be in the form namespace:value.';
const NO_SCOPE = 'This collection has no tag vocabulary to file a new term under.';

const asEntityKind = (value: string): EntityKind | undefined =>
  ENTITY_KINDS.find(kind => kind === value);

const createTagFor = async (collectionKind: string, key: string): Promise<TagCreateResult> => {
  const scope = asEntityKind(collectionKind);
  if (!scope) return { success: false, error: NO_SCOPE };
  if (!isTagKey(key)) return { success: false, error: NOT_CONVENTION };

  const result = await window.api.screenEditor.allocateTag({ key, appliesTo: [scope] });
  if (!result.success) return { success: false, error: result.error };

  const { record } = result;
  registerTag(record);
  invalidateTagSuggestions();
  registerIdRefOption('tag', {
    value: record.id,
    label: resolveRecordLabel(record.id),
    description: record.id,
  });
  return { success: true, id: record.id };
};

/** Cached per collection so the editor's binding memo is not invalidated every render. */
const tagCreatorFor = (collectionKind: string): TagCreator => {
  const held = creators.get(collectionKind);
  if (held) return held;
  const built: TagCreator = key => createTagFor(collectionKind, key);
  creators.set(collectionKind, built);
  return built;
};

export { createTagFor, tagCreatorFor };
