/* @layer shared-game @kind data */
/**
 * Player-pose atlas: the generated table, plus the few lookups callers actually need.
 *
 * The JSON is a transcription of six tables in the decompilation (player_oam.c and misc.c)
 * so regenerate it instead of editing it. Facing indices follow the engine's own
 * `link_direction_facing >> 1`, so 0 is up, 1 down, 2 left, 3 right.
 */
import atlasJson from './player-pose-atlas.json';
import type { PoseAtlas, PoseFrame, PoseState } from './player-pose-atlas.type';

const POSE_ATLAS = atlasJson as PoseAtlas;

type Facing = 0 | 1 | 2 | 3;

const FACINGS: readonly Facing[] = [0, 1, 2, 3];
const FACING_LABELS: Record<Facing, string> = { 0: 'Up', 1: 'Down', 2: 'Left', 3: 'Right' };

const stateFor = (action: number): PoseState | null =>
  POSE_ATLAS.states.find((s) => s.action === action) ?? null;

/** The facings a state distinguishes. One entry when it has no facing variation. */
const facingsOf = (state: PoseState): readonly Facing[] => (state.perFacing ? FACINGS : [0]);

/** Frames of one state and facing, in play order. Empty when the state has no such facing. */
const framesOf = (state: PoseState, facing: Facing): readonly PoseFrame[] => {
  const key = String(state.perFacing ? facing : 0);
  const slots = state.frames[key] ?? [];
  return slots.map((slot) => POSE_ATLAS.frames[slot]).filter(Boolean);
};

/** Canvas size that fits every pose, and the origin to draw at within it. */
const poseCanvasSize = (): { width: number; height: number; originX: number; originY: number } => {
  const { minX, minY, maxX, maxY } = POSE_ATLAS.bounds;
  return { width: maxX - minX, height: maxY - minY, originX: -minX, originY: -minY };
};

export { POSE_ATLAS, FACINGS, FACING_LABELS, stateFor, facingsOf, framesOf, poseCanvasSize };
export type { Facing };
