/* @layer renderer-hud @kind constants */
import { poseCanvasSize } from '@rotp/game-data';

const { width: POSE_W, height: POSE_H, originX, originY } = poseCanvasSize();

const POSE_ORIGIN = { x: originX, y: originY } as const;

export { POSE_H, POSE_ORIGIN, POSE_W };
