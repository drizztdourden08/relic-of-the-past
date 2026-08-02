/* @layer renderer-app @kind logic */
/**
 * Minting a vocabulary term from the editor.
 *
 * The editor can say "this term does not exist yet" and no more — writing a
 * record is not something the design system does. This is the other side: the
 * term goes to the main process, which validates the shape, allocates the id
 * and appends the record to the dataset file, and what comes back is folded
 * into the in-memory collection so the chip that triggered it resolves at once
 * instead of after a reload.
 *
 * The convention is checked here too, before the round trip. That is not the
 * check that counts — the writer's is, because it is the one between a bad key
 * and the file — but refusing locally means the obvious mistake never becomes a
 * failed IPC call the user has to read an error from.
 *
 * Either check can still be the one that fails, and either way the reason
 * travels back rather than collapsing into a bare null: the entry that asked
 * has a place to show it, and a silent refusal reads as a bug, not a rule.
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

/**
 * The creator bound to one collection, kept so the editor's binding memo is not
 * invalidated by a fresh closure on every render — the same bargain the
 * suggestion resolver makes.
 */
const tagCreatorFor = (collectionKind: string): TagCreator => {
  const held = creators.get(collectionKind);
  if (held) return held;
  const built: TagCreator = key => createTagFor(collectionKind, key);
  creators.set(collectionKind, built);
  return built;
};

export { createTagFor, tagCreatorFor };
