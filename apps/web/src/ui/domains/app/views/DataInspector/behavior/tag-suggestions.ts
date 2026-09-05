/* @layer renderer-app @kind logic */
/**
 * Tag suggestions for the editor (sibling of `id-ref-options`). Unions two
 * sources: the tag collection (the canonical vocabulary, including terms not
 * yet in use) and the values already in use at this path (a hand-added tag
 * must be findable or it gets retyped differently). Suggestions are terms
 * (`env:outdoor`), not ids; the editor translates through the reference
 * lookup. `appliesTo` filters the vocabulary per collection. Values in use
 * lead, each half sorted. Cached per collection-and-path: the rows never
 * change, and the search box would otherwise rebuild per keystroke.
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

/** Every term the rows hold at this path. Stored ids resolve to terms; dangling ids are skipped. */
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

/** What a tag on this field could be. Empty when unanswerable; the entry stays usable, unassisted. */
const resolveTagSuggestionsFor = (
  collectionKind: string,
  field: FieldDescriptor,
): readonly string[] => {
  const kind = asEntityKind(collectionKind);
  return kind ? suggestionsFor(kind, field.path) : NONE;
};

/** Cached per collection so the editor's binding memo is not invalidated every render. */
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
