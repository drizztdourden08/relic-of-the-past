/* @layer shared-game @kind types */

type PedestalGate = 'pendants' | 'lightWorldDungeons' | 'anyThreeDungeons' | 'open' | 'onePendant' | 'twoPendants';
type SahasrahlaGate = 'pendant' | 'easternPalace';
type BarrierGate = 'sword' | 'pedestal' | 'pendants' | 'lightWorldDungeons';
type BombShopGate = 'crystals' | 'iceAndMire' | 'towerCount';
type CountKind = 'crystals' | 'darkWorldDungeons';
type PyramidHoleGate = 'agahnim2' | 'open' | 'towerCount';

interface CountGate {
  kind: CountKind;
  count: number;
}

interface StoryGateSetting {
  pedestalScenes: boolean;
  pedestal: PedestalGate;
  sahasrahla: SahasrahlaGate;
  barrier: BarrierGate;
  bombShop: BombShopGate;
  bombShopAsksSmiths: boolean;
  tower: CountGate;
  ganon: CountGate;
  pyramidHole: PyramidHoleGate;
  heraMusic: boolean;
  vaneScene: boolean;
  mountainRespawn: boolean;
}

export type {
  BarrierGate, BombShopGate, CountGate, CountKind, PedestalGate, PyramidHoleGate, SahasrahlaGate, StoryGateSetting,
};
