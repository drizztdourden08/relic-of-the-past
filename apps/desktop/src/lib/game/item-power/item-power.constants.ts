/* @layer bridge-wasm @kind constants */
const ITEM_POWER_BIT = {
  noFairyCatching: 1,
  noByrnaBarrierGuard: 2,
  capeDoubleMagic: 4,
  silverArrowsBossOnly: 8,
  noPowderFairy: 16,
  hammerWakesTablets: 32,
  swordlessMedallions: 64,
  pullableCurtains: 128,
  hammerLastFight: 256,
  hammerBreaksSeal: 512,
  wishPondPlan: 8192,
} as const;

const ITEM_POWER_GATE_WORD = 4;

export { ITEM_POWER_BIT, ITEM_POWER_GATE_WORD };
