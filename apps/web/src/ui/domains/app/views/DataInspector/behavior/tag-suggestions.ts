/* @layer renderer-app @kind logic */
/**
 * The vocabulary half of the tag handoff, and the sibling of `id-ref-options`.
 *
 * `RecordEditor` knows a field is a tag list and stops there — what tags exist
 * is dataset knowledge the design system may not import. This is the other
 * side: given a collection and the field being edited, hand back everything a
 * tag on it could reasonably be.
 *
 * It reads TWO sources and unions them. The tag collection is the canonical
 * vocabulary, and it is the whole point of having one — an editor that only
 * offered what happens to be in use would quietly hide every term nobody has
 * reached for yet. What is already IN USE is the other half, because a dataset
 * grows values before the vocabulary catches up, and a tag somebody added by
 * hand has to be findable or it gets retyped slightly differently next time.
 *
 * The suggestions are TERMS (`env:outdoor`), not tag ids, because a term is
 * what a person searches for and the ids are the storage detail underneath.
 * The editor translates between the two through the reference lookup, which
 * carries both halves already.
 *
 * `appliesTo` is what makes the list per-collection: the vocabulary is one
 * collection, but a crossing's terms are no use on a screen and offering all of
 * them would bury the twenty that apply under sixty that do not.
 *
 * Values in use lead, because they are far and away the likelier pick, and each
 * half is sorted so the panel reads the same way every time. Each list is built
 * once per collection-and-path and kept, exactly as the reference lists are:
 * the rows are module-level and never change, and the search box would
 * otherwise rebuild the whole vocabulary per keystroke.
 */
import { all, tagKey, tagsFor } from '@shared/game/data';
import { getPath } from '@ds/data/schema/path';
import { ENTITY_KINDS } from '../DataInspector.constants';
import type { EntityKind } from '@shared/game/data';
import type { FieldDescriptor } from '@ds/data';
import type { TagSuggestionResolver } from '@ds/composites/RecordEditor';

const NONE: readonly string[] = [];

const cache = new Map<string, readonly string[]>();
const resolvers = new Map<string, TagSuggestionResolver>();

const asEntityKind = (value: string): EntityKind | undefined =>
  ENTITY_KINDS.find(kind => kind === value);

/**
 * Every term the collection's rows actually hold at this path. A stored value
 * is a tag id, so it is resolved back to its term; an id nothing resolves is
 * skipped rather than offered, since a dangling reference is not a suggestion.
 */
const valuesInUse = (kind: EntityKind, path: string): readonly string[] => {
  const used = new Set<string>();
  for (const row of all(kind) as readonly unknown[]) {
    const held = getPath(row, path);
    if (!Array.isArray(held)) continue;
    for (const entry of held) {
      if (typeof entry !== 'string' || !entry) continue;
      const key = tagKey(entry);
      if (key) used.add(key);
    }
  }
  return [...used];
};

const buildSuggestions = (kind: EntityKind, path: string): readonly string[] => {
  const used = [...valuesInUse(kind, path)].sort();
  const known = new Set(used);
  const unused = tagsFor(kind).map(tag => tag.name).filter(name => !known.has(name)).sort();
  return [...used, ...unused];
};

const suggestionsFor = (kind: EntityKind, path: string): readonly string[] => {
  const key = `${kind}.${path}`;
  const held = cache.get(key);
  if (held) return held;
  const built = buildSuggestions(kind, path);
  cache.set(key, built);
  return built;
};

/**
 * What a tag on this field could be. Empty for a collection this screen cannot
 * answer for, which leaves the entry usable and simply unassisted.
 */
const resolveTagSuggestionsFor = (
  collectionKind: string,
  field: FieldDescriptor,
): readonly string[] => {
  const kind = asEntityKind(collectionKind);
  return kind ? suggestionsFor(kind, field.path) : NONE;
};

/**
 * The resolver bound to one collection, kept so the editor's binding memo is
 * not invalidated by a fresh closure on every render.
 */
const tagSuggestionsResolverFor = (collectionKind: string): TagSuggestionResolver => {
  const held = resolvers.get(collectionKind);
  if (held) return held;
  const built: TagSuggestionResolver = field => resolveTagSuggestionsFor(collectionKind, field);
  resolvers.set(collectionKind, built);
  return built;
};

/** Drops the built lists, so a newly minted term shows up without a reload. */
const invalidateTagSuggestions = (): void => cache.clear();

export { invalidateTagSuggestions, resolveTagSuggestionsFor, tagSuggestionsResolverFor };
