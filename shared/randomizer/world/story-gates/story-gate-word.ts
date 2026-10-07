/* @layer shared-game @kind logic */
/**
 * The story gates as gate-word-5 fields (core/zelda3/src/features.h kFeatures5_*): the bit
 * layout the core reads, and the setting folded into it. Pure, so the seed's own word and
 * the settings' word are computed by the same function on both sides.
 */
import { DEFAULT_STORY_GATES } from './story-gates.data';
import type { BarrierGate, BombShopGate, CountGate, PedestalGate, PyramidHoleGate, StoryGateSetting } from './story-gate.type';

/** features.h kFeatures5_*: keep in lockstep with that enum. */
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

const field = (name: keyof typeof STORY_FIELD, value: number): number =>
  (value & STORY_FIELD[name].mask) << STORY_FIELD[name].shift;

/** A count gate as its field: the crystal kind at seven is the original, so it stays zero. */
const countField = (name: 'towerCount' | 'ganonCount', kindBit: number, gate: CountGate): number => {
  if (gate.kind === 'crystals' && gate.count === 7) return 0;
  return field(name, gate.count) | (gate.kind === 'darkWorldDungeons' ? kindBit : 0);
};

/** The word a setting asks for; the ledger and the re-offer reading always ride along. */
const storyWordOf = (s: StoryGateSetting): number => {
  let word = STORY_BIT.eventLedger | STORY_BIT.giverReoffer;
  if (s.pedestalScenes) word |= STORY_BIT.pedestalScenes;
  word |= field('pedestalGate', PEDESTAL_MODE[s.pedestal]);
  if (s.sahasrahla === 'easternPalace') word |= STORY_BIT.sahasrahlaGate;
  word |= field('barrierGate', BARRIER_MODE[s.barrier]);
  word |= field('bombShopGate', BOMB_SHOP_MODE[s.bombShop]);
  if (!s.bombShopAsksSmiths) word |= STORY_BIT.bombShopSmith;
  word |= countField('towerCount', STORY_BIT.towerCountKind, s.tower);
  word |= countField('ganonCount', STORY_BIT.ganonCountKind, s.ganon);
  word |= field('pyramidHole', PYRAMID_MODE[s.pyramidHole]);
  if (s.heraMusic) word |= STORY_BIT.heraMusic;
  if (s.vaneScene) word |= STORY_BIT.vaneScene;
  if (s.mountainRespawn) word |= STORY_BIT.mountainRespawn;
  return word >>> 0;
};

/** Every scene gate on and the ledger recording; every count at the original number. */
const DEFAULT_STORY_WORD = storyWordOf(DEFAULT_STORY_GATES);

export { DEFAULT_STORY_WORD, STORY_BIT, STORY_FIELD, storyWordOf };
