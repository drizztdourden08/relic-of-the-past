/* @layer renderer-app @kind logic */
import type { TagSuggestionResolver } from '@drizztdourden08/tessera/composites';

const suggestionResolvers = new Map<string, TagSuggestionResolver>();

export { suggestionResolvers };
