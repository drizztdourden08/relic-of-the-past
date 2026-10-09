/* @layer shared @kind logic */
import { FEATURES_BY_ID } from '../feature-registry';
import type { AutoDisabledFeature, ResolveResult } from './resolve-features.type';

const resolveFeatures = (enabled: Iterable<string>): ResolveResult => {
  const effective = new Set(enabled);
  const autoDisabled: AutoDisabledFeature[] = [];
  let changed = true;
  while (changed) {
    changed = false;
    for (const id of [...effective]) {
      const def = FEATURES_BY_ID[id];
      if (!def) continue;
      const missing = def.requires.filter((r) => !effective.has(r));
      if (missing.length > 0) {
        effective.delete(id);
        autoDisabled.push({ id, missing });
        changed = true;
      }
    }
  }
  return { effective, autoDisabled };
};

export { resolveFeatures };
