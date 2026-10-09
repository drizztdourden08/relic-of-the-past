/* @layer renderer-lib @kind constants */
import { POSE_ATLAS } from '@shared/game/data/native-tables/player-pose-atlas';
import { TILE } from './draw-tiles';

const QUAD_TILES = POSE_ATLAS.quadSize / TILE;

export { QUAD_TILES };
