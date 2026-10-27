/* @layer website-site @kind types */
import type { FeatureVisual } from '../feature-visual.type';

type VisualOf<K extends FeatureVisual['kind']> = Extract<FeatureVisual, { kind: K }>;

type Degrader<K extends FeatureVisual['kind']> = (visual: VisualOf<K>) => FeatureVisual | null;

type Degraders = { [K in FeatureVisual['kind']]: Degrader<K> };

export type { Degrader, Degraders };
