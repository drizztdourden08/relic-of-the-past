/* @layer shared-hud @kind constants */
import type { Size } from '../geometry.type';

const HEART_SIZE = 8;
const HEARTS_PER_ROW = 10;
const DEFAULT_HEARTS = 20;
const RESERVED_HEART_ROWS = 2;

const LIFE_SIZE: Size = {
  w: HEART_SIZE * HEARTS_PER_ROW,
  h: HEART_SIZE * RESERVED_HEART_ROWS,
};

const MAGIC_FRAME = 1;
const MAGIC_SIZE: Size = { w: 80, h: 16 };

const CONSUMABLES_SIZE: Size = { w: 30, h: 24 };

const WALLET_SIZE: Size = { w: 48, h: 16 };

const COUNTDOWN_SIZE: Size = { w: 44, h: 44 };

export {
  CONSUMABLES_SIZE,
  COUNTDOWN_SIZE,
  DEFAULT_HEARTS,
  HEARTS_PER_ROW,
  HEART_SIZE,
  LIFE_SIZE,
  MAGIC_FRAME,
  MAGIC_SIZE,
  RESERVED_HEART_ROWS,
  WALLET_SIZE,
};
