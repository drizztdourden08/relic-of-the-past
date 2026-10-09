/* @layer shared @kind logic */
import type { FeatureDef } from '../feature.type';
import { FEATURES_BY_ID } from '../feature-registry';

const suggestionsFor = (id: string, enabled: ReadonlySet<string>): FeatureDef[] =>
  (FEATURES_BY_ID[id]?.suggests ?? [])
    .map((s) => FEATURES_BY_ID[s])
    .filter((d): d is FeatureDef => d !== undefined &&!enabled.has(d.id));

export { suggestionsFor };
