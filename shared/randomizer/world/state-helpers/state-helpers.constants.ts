/* @layer shared-game @kind constants */
const BASELINE = {
  progressiveBottleLimit: 4,
  logicalHeartPieces: 24,
  logicalHeartContainers: 10,
  startingHearts: 3,
} as const;

const HEART_PIECES_PER_HEART = 4;

const MAX_BOMBS_ASKED = 50;

const MAGIC_UNITS_AT_FULL_COST = 8;

export { BASELINE, HEART_PIECES_PER_HEART, MAGIC_UNITS_AT_FULL_COST, MAX_BOMBS_ASKED };
