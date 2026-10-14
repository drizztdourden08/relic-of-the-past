/* @layer renderer-app @kind logic */
import type { EntityKind } from '@rotp/game-data';
import { buildSuggestions } from './build-suggestions';
import { suggestionCache } from './suggestion-cache';

const suggestionsFor = (kind: EntityKind, path: string): readonly string[] => {
  const key = `${kind}.${path}`;
  const held = suggestionCache.get(key);
  if (held) return held;
  const built = buildSuggestions(kind, path);
  suggestionCache.set(key, built);
  return built;
};

export { suggestionsFor };
