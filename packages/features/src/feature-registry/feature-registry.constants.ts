/* @layer shared @kind constants */
import type { FeatureDef } from '../feature.type';
import { FEATURES } from './features.data';

const FEATURES_BY_ID: Record<string, FeatureDef> = Object.fromEntries(FEATURES.map((feature) => [feature.id, feature]));

export { FEATURES_BY_ID };
