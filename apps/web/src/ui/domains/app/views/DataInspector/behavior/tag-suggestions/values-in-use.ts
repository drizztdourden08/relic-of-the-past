/* @layer renderer-app @kind logic */
import { all, tagKey } from '@shared/game/data';
import { getPath } from '@ds/data/schema/path';
import type { EntityKind } from '@shared/game/data';

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

export { valuesInUse };
