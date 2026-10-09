/* @layer renderer-hud @kind constants */
const TREE_STEP = 16;
const TREE_ROWS = 12;
const MOUNTAIN_LIFT_ABOVE_WATER = 8;
const MOUNTAIN_GAP = { min: 120, max: 320 } as const;
const MOUNTAIN_PAIR_CHANCE = 0.35;
const MOUNTAIN_OVERLAP = { min: 24, max: 44 } as const;
const CLOUD_EVERY = 72;
const CLOUD_SPEED = { min: 0.4, max: 1.1 } as const;
const MOUNTAIN_PARALLAX = 0.4;
const TREE_PARALLAX = 1;

export {
  CLOUD_EVERY, CLOUD_SPEED, MOUNTAIN_GAP, MOUNTAIN_LIFT_ABOVE_WATER, MOUNTAIN_OVERLAP, MOUNTAIN_PAIR_CHANCE, MOUNTAIN_PARALLAX, TREE_PARALLAX,
  TREE_ROWS, TREE_STEP,
};
