/* @layer renderer-app @kind logic */
import type { TagSuggestionResolver } from '@ds/composites/RecordEditor';
import { resolveTagSuggestionsFor } from './resolve-tag-suggestions-for';
import { suggestionResolvers } from './suggestion-resolvers';

const tagSuggestionsResolverFor = (collectionKind: string): TagSuggestionResolver => {
  const held = suggestionResolvers.get(collectionKind);
  if (held) return held;
  const built: TagSuggestionResolver = field => resolveTagSuggestionsFor(collectionKind, field);
  suggestionResolvers.set(collectionKind, built);
  return built;
};

export { tagSuggestionsResolverFor };
