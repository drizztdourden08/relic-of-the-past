/* @layer shared-game @kind logic */
import type { PoseCanvasSize } from '../player-pose-atlas.type';
import { POSE_ATLAS } from './player-pose-atlas.constants';

const poseCanvasSize = (): PoseCanvasSize => {
  const { minX, minY, maxX, maxY } = POSE_ATLAS.bounds;
  return { width: maxX - minX, height: maxY - minY, originX: -minX, originY: -minY };
};

export { poseCanvasSize };
