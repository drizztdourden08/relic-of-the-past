/* @layer shared-game @kind constants */
import atlasJson from './player-pose-atlas.json';
import type { Facing, PoseAtlas } from '../player-pose-atlas.type';

const POSE_ATLAS = atlasJson as PoseAtlas;

const FACINGS: readonly Facing[] = [0, 1, 2, 3];
const FACING_LABELS: Record<Facing, string> = { 0: 'Up', 1: 'Down', 2: 'Left', 3: 'Right' };

export { FACINGS, FACING_LABELS, POSE_ATLAS };
