/* @layer renderer-app @kind logic */
import type { TagSuggestionResolver } from '@ds/composites/RecordEditor';

const suggestionResolvers = new Map<string, TagSuggestionResolver>();

export { suggestionResolvers };
