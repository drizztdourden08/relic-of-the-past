/* @layer renderer-hooks @kind logic */
import { DEFAULT_POSE_LABELS } from './pose-labels-of.constants';
import type { PoseLabels } from './pose-labels.type';

const poseLabelsOf = (given?: Partial<PoseLabels>): PoseLabels => ({ ...DEFAULT_POSE_LABELS, ...given });

export { poseLabelsOf };
