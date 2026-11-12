/* @layer website-site @kind types */
import type { FeatureVisual } from '../feature-visual.type';

type AnyDegrader = (visual: FeatureVisual) => FeatureVisual | null;

export type { AnyDegrader };
