/* @layer shared-game @kind constants */
import type { Facing } from '../../data/native-tables/player-pose-atlas';
import type { HeroPose } from './hero-idle.type';
import { WALK_PX_PER_FRAME } from './native-timings';
import { FACING_TOWARD_VIEWER } from './sequence-table';

const STANDING_FRAME = 0;

const MAX_LEG_CYCLES = 2;

const LOOK_TURNS: readonly [number, number] = [2, 3];

const RAISE_BLADE_FRAMES = 11;

const STEP_BY_FACING: Readonly<Record<Facing, { x: number; y: number }>> = {
  0: { x: 0, y: -WALK_PX_PER_FRAME },
  1: { x: 0, y: WALK_PX_PER_FRAME },
  2: { x: -WALK_PX_PER_FRAME, y: 0 },
  3: { x: WALK_PX_PER_FRAME, y: 0 },
};

const START_FACING = FACING_TOWARD_VIEWER as Facing;

const REST: HeroPose = { action: 0x00, frame: 0, facing: START_FACING, offsetX: 0, offsetY: 0 };

const REPEATABLE: ReadonlySet<string> = new Set(['stand']);

const MAX_CATCH_UP_TAKES = 64;

export {
  LOOK_TURNS, MAX_CATCH_UP_TAKES, MAX_LEG_CYCLES, RAISE_BLADE_FRAMES, REPEATABLE, REST, STANDING_FRAME, START_FACING,
  STEP_BY_FACING,
};
