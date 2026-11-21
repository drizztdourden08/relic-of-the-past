/* @layer renderer-hooks @kind constants */
import { FACING_LABELS, GROUP_LABELS, labelFor } from '@rotp/game-data';
import { GLOVE_LABELS, OUTFIT_LABELS } from '../useWearing';
import type { PoseLabels } from './pose-labels.type';

const DEFAULT_POSE_LABELS: PoseLabels = {
  allFacings: 'All facings',
  noFacingVariation: 'no facing variation',
  bodyOnly: 'Body only. The blade, shield and held items are drawn from other graphics the engine '
    + 'stages separately, so no sprite sheet can supply them.',
  wearing: 'Wearing',
  gloves: 'Gloves',
  stateName: (action) => labelFor(action).label,
  groupName: (group) => GROUP_LABELS[group],
  facingName: (facing) => FACING_LABELS[facing],
  frameCount: (count) => `${count} fr`,
  actionId: (hex) => `action 0x${hex}`,
  filterStates: (count) => `Filter ${count} states...`,
  sheetSize: (cols, rows, width, height) => `${cols} x ${rows} tiles · ${width} x ${height} px`,
  outfitName: (outfit) => OUTFIT_LABELS[outfit],
  gloveName: (gloves) => GLOVE_LABELS[gloves],
};

export { DEFAULT_POSE_LABELS };
