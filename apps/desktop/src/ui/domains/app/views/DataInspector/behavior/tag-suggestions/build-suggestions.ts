/* @layer renderer-app @kind logic */
import { tagsFor } from '@rotp/game-data';
import type { EntityKind } from '@rotp/game-data';
import { valuesInUse } from './values-in-use';

const buildSuggestions = (kind: EntityKind, path: string): readonly string[] => {
  const used = [...valuesInUse(kind, path)].sort();
  const known = new Set(used);
  const unused = tagsFor(kind).map(tag => tag.name).filter(name => !known.has(name)).sort();
  return [...used, ...unused];
};

export { buildSuggestions };
