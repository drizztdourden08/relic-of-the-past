/* @layer shared @kind logic */
import type { FeatureDef } from '../feature.type';
import { FEATURES_BY_ID } from '../feature-registry';

const requirementClosure = (id: string, enabled: ReadonlySet<string>): FeatureDef[] => {
  const out: FeatureDef[] = [];
  const seen = new Set<string>([id]);
  const visit = (cur: string) => {
    for (const r of FEATURES_BY_ID[cur]?.requires ?? []) {
      if (seen.has(r)) continue;
      seen.add(r);
      const def = FEATURES_BY_ID[r];
      if (def && !enabled.has(r)) out.push(def);
      visit(r);
    }
  };
  visit(id);
  return out;
};

export { requirementClosure };
