/* @layer shared-game @kind data */
import type { HeroSequenceDef } from './hero-idle.type';

const HERO_SEQUENCES: readonly HeroSequenceDef[] = [
  { id: 'walk', kind: 'pace', weight: 34, facing: 'random', frames: [68, 136] },
  { id: 'swing', kind: 'swing', weight: 22, facing: 'keep' },
  { id: 'stand', kind: 'still', weight: 14, facing: 'keep', frames: [45, 110] },
  { id: 'look', kind: 'look', weight: 10, facing: 'random', frames: [54, 108] },
  { id: 'spin', kind: 'charge-spin', weight: 8, facing: 'keep' },
  { id: 'raise', kind: 'flourish', weight: 3, facing: 'toward-viewer' },
];

const FACING_TOWARD_VIEWER = 1;

export { FACING_TOWARD_VIEWER, HERO_SEQUENCES };
