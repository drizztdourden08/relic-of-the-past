/* @layer shared-game @kind types */
import type { Facing } from '../../data/native-tables/player-pose-atlas';

type FacingRule = 'keep' | 'random' | 'toward-viewer';

type HeroSequenceKind = 'still' | 'look' | 'pace' | 'swing' | 'charge-spin' | 'flourish';

type HeroSequenceId = 'stand' | 'look' | 'walk' | 'swing' | 'spin' | 'raise';

interface HeroSequenceDef {
  id: HeroSequenceId;
  kind: HeroSequenceKind;
  weight: number;
  facing: FacingRule;
  frames?: readonly [number, number];
}

interface HeroBeat {
  action: number;
  frame: number;
  facing: Facing;
  hold: number;
  vx: number;
  vy: number;
}

interface HeroTake {
  id: HeroSequenceId;
  beats: readonly HeroBeat[];
  frames: number;
  endFacing: Facing;
}

interface HeroIdleState {
  take: HeroTake;
  startedAt: number;
}

interface HeroPose {
  action: number;
  frame: number;
  facing: Facing;
  offsetX: number;
  offsetY: number;
}

type HeroRng = () => number;

export type {
  FacingRule, HeroBeat, HeroIdleState, HeroPose, HeroRng, HeroSequenceDef,
  HeroSequenceId, HeroSequenceKind, HeroTake,
};
