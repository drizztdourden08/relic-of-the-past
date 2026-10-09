/* @layer renderer-app @kind logic */
import { suggestionCache } from './suggestion-cache';

const invalidateTagSuggestions = (): void => suggestionCache.clear();

export { invalidateTagSuggestions };
