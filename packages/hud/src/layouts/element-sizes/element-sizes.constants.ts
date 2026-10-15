/* @layer shared-hud @kind constants */
import type { Size } from '../geometry.type';

const HEART_SIZE = 8;
const DEFAULT_HEARTS = 20;

const MAGIC_SIZE: Size = { w: 80, h: 16 };

const WALLET_SIZE: Size = { w: 48, h: 16 };

const COUNTDOWN_SIZE: Size = { w: 44, h: 44 };

export {
  COUNTDOWN_SIZE,
  DEFAULT_HEARTS,
  HEART_SIZE,
  MAGIC_SIZE,
  WALLET_SIZE,
};
