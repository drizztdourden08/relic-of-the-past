/* @layer renderer-components @kind constants */
const SAMPLE_HEALTH_CAPACITY = 20 * 8;
const SAMPLE_HEALTH_CURRENT = 14 * 8;
const SAMPLE_MAGIC = 64;

const SAMPLE_HUD = {
  healthCurrent: SAMPLE_HEALTH_CURRENT,
  healthCapacity: SAMPLE_HEALTH_CAPACITY,
  magicPower: SAMPLE_MAGIC,
  halfMagic: false,
  bombs: 7,
  maxBombs: 10,
  arrows: 22,
  maxArrows: 30,
  keys: 3,
  rupees: 486,
  maxRupees: 999,
};

const SAMPLE_COUNTDOWN = { total: 30, remaining: 18, fractionLeft: 0.6, frames: 40 };

const SAMPLE_ITEMS: readonly [number, ...number[]] = [3, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1];
const SAMPLE_BOTTLES: readonly number[] = [2, 2, 0, 0];
const SAMPLE_SWORD_TIER = 2;

const SAMPLE_ITEM_POOL: readonly number[] = [1, 2, 3, 4, 5, 6, 8, 9, 11, 13, 15, 17, 18, 21];

export {
  SAMPLE_BOTTLES,
  SAMPLE_COUNTDOWN,
  SAMPLE_HUD,
  SAMPLE_ITEMS,
  SAMPLE_ITEM_POOL,
  SAMPLE_SWORD_TIER,
};
