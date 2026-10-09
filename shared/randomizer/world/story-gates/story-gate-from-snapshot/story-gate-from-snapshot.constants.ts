/* @layer shared-game @kind constants */
import type {
  BarrierGate, BombShopGate, CountKind, PedestalGate, PyramidHoleGate, SahasrahlaGate,
} from '../story-gate.type';

const PEDESTAL_GATES: readonly PedestalGate[] = ['pendants', 'lightWorldDungeons', 'anyThreeDungeons', 'open', 'onePendant', 'twoPendants'];
const SAHASRAHLA_GATES: readonly SahasrahlaGate[] = ['pendant', 'easternPalace'];
const BARRIER_GATES: readonly BarrierGate[] = ['sword', 'pedestal', 'pendants', 'lightWorldDungeons'];
const BOMB_SHOP_GATES: readonly BombShopGate[] = ['crystals', 'iceAndMire', 'towerCount'];
const COUNT_KINDS: readonly CountKind[] = ['crystals', 'darkWorldDungeons'];
const PYRAMID_GATE_OF_VALUE: Readonly<Record<string, PyramidHoleGate>> = { closed: 'agahnim2', goal: 'agahnim2', open: 'open', auto: 'towerCount' };
const PYRAMID_VALUE_OF_GATE: Readonly<Record<PyramidHoleGate, string>> = { agahnim2: 'goal', open: 'open', towerCount: 'auto' };
const MAX_GATE_COUNT = 7;

export {
  BARRIER_GATES, BOMB_SHOP_GATES, COUNT_KINDS, MAX_GATE_COUNT, PEDESTAL_GATES, PYRAMID_GATE_OF_VALUE, PYRAMID_VALUE_OF_GATE,
  SAHASRAHLA_GATES,
};
