/* @layer shared-game @kind types */
/**
 * Which recorded event each of the game's story gates reads, and what the count gates ask
 * for. Every gate has a default that is the story as the game tells it: the event reading
 * for the scenes, the original numbers for the counts. The item reading the unmodified game
 * uses is not a choice here; Vanilla Safe alone restores it (core/zelda3/src/features.h).
 */

/** What the Master Sword pedestal asks for. */
type PedestalGate = 'pendants' | 'lightWorldDungeons' | 'anyThreeDungeons' | 'open' | 'onePendant' | 'twoPendants';
/** What the eastern sage asks for before his gift. */
type SahasrahlaGate = 'pendant' | 'easternPalace';
/** What the castle barrier falls to. */
type BarrierGate = 'sword' | 'pedestal' | 'pendants' | 'lightWorldDungeons';
/** When the Bomb Shop puts the Big Bomb on sale. */
type BombShopGate = 'crystals' | 'iceAndMire' | 'towerCount';
/** What a count gate counts. */
type CountKind = 'crystals' | 'darkWorldDungeons';
/** When the Pyramid hole opens. */
type PyramidHoleGate = 'agahnim2' | 'open' | 'towerCount';

interface CountGate {
  kind: CountKind;
  /** 0 to 7. Zero with the crystal kind is the original number, seven. */
  count: number;
}

interface StoryGateSetting {
  /** The Sanctuary, the Loyal Sage, the overworld music and four hint lines follow the pedestal, never the sword. */
  pedestalScenes: boolean;
  pedestal: PedestalGate;
  sahasrahla: SahasrahlaGate;
  barrier: BarrierGate;
  bombShop: BombShopGate;
  /** The original also asks for the Smiths reunited; off waives that part. */
  bombShopAsksSmiths: boolean;
  tower: CountGate;
  ganon: CountGate;
  pyramidHole: PyramidHoleGate;
  /** The Tower of Hera's boss music follows Moldorm, never the pendant. */
  heraMusic: boolean;
  /** The weathervane scene and Stumpy follow the weathervane, never the Flute. */
  vaneScene: boolean;
  /** The Death Mountain respawn follows the Old Man's rescue, never the Mirror. */
  mountainRespawn: boolean;
}

export type { BarrierGate, BombShopGate, CountGate, CountKind, PedestalGate, PyramidHoleGate, SahasrahlaGate, StoryGateSetting };
