/* @layer renderer-hooks @kind constants */
import type { PoseLabels } from './pose-labels.type';

const DEFAULT_POSE_TEXT: Pick<PoseLabels, 'allFacings' | 'noFacingVariation' | 'bodyOnly' | 'wearing' | 'gloves'> = {
  allFacings: 'All facings',
  noFacingVariation: 'no facing variation',
  bodyOnly: 'Body only. The blade, shield and held items are drawn from other graphics the engine '
    + 'stages separately, so no sprite sheet can supply them.',
  wearing: 'Wearing',
  gloves: 'Gloves',
};

export { DEFAULT_POSE_TEXT };
