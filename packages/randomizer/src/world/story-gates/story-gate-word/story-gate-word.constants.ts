/* @layer shared-game @kind constants */
import type {
  BarrierGate, BombShopGate, PedestalGate, PyramidHoleGate,
} from '../story-gate.type';

const STORY_BIT = {
  eventLedger: 1 << 1,
  pedestalScenes: 1 << 2,
  sahasrahlaGate: 1 << 6,
  towerCountKind: 1 << 14,
  ganonCountKind: 1 << 18,
  heraMusic: 1 << 21,
  vaneScene: 1 << 22,
  mountainRespawn: 1 << 23,
  bombShopSmith: 1 << 24,
  giverReoffer: 1 << 25,
} as const;

const STORY_FIELD = {
  pedestalGate: { shift: 3, mask: 7 },
  barrierGate: { shift: 7, mask: 3 },
  bombShopGate: { shift: 9, mask: 3 },
  towerCount: { shift: 11, mask: 7 },
  ganonCount: { shift: 15, mask: 7 },
  pyramidHole: { shift: 19, mask: 3 },
} as const;

const PEDESTAL_MODE: Readonly<Record<PedestalGate, number>> = {
  pendants: 0, lightWorldDungeons: 1, anyThreeDungeons: 2, open: 3, onePendant: 4, twoPendants: 5,
};
const BARRIER_MODE: Readonly<Record<BarrierGate, number>> = { sword: 0, pedestal: 1, pendants: 2, lightWorldDungeons: 3 };
const BOMB_SHOP_MODE: Readonly<Record<BombShopGate, number>> = { crystals: 0, iceAndMire: 1, towerCount: 2 };
const PYRAMID_MODE: Readonly<Record<PyramidHoleGate, number>> = { agahnim2: 0, open: 1, towerCount: 2 };

const ORIGINAL_CRYSTAL_COUNT = 7;

export {
  BARRIER_MODE, BOMB_SHOP_MODE, ORIGINAL_CRYSTAL_COUNT, PEDESTAL_MODE, PYRAMID_MODE, STORY_BIT, STORY_FIELD,
};
