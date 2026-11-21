/* @layer renderer-hooks @kind logic */
import { FACING_LABELS, GROUP_LABELS, labelFor } from '@rotp/game-data';
import { GLOVE_LABELS, OUTFIT_LABELS } from '../useWearing';
import { DEFAULT_POSE_TEXT } from './pose-labels-of.constants';
import type { PoseLabels } from './pose-labels.type';

const DEFAULT_POSE_LABELS: PoseLabels = {
  ...DEFAULT_POSE_TEXT,
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

const poseLabelsOf = (given?: Partial<PoseLabels>): PoseLabels => ({ ...DEFAULT_POSE_LABELS, ...given });

export { poseLabelsOf };
