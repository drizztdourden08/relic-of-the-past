/* @layer website-site @kind logic */
import type { FeatureVisual } from '../feature-visual.type';
import { DEGRADERS } from './ready-visual.constants';
import type { AnyDegrader } from './ready-visual-of.type';

const readyVisualOf = (visual: FeatureVisual): FeatureVisual | null =>
  (DEGRADERS[visual.kind] as AnyDegrader)(visual);

export { readyVisualOf };
