/* @layer shared-game @kind types */
type TraversalRequirement =
  | 'lift.1' | 'lift.2' | 'lift.3'
  | 'sword' | 'boomerang' | 'bombs' | 'hammer' | 'powder'
  | 'boots' | 'flippers' | 'hookshot' | 'mirror' | 'moonpearl'
  | 'flute' | 'cape' | 'byrna' | 'somaria'
  | 'bow' | 'firerod' | 'icerod' | 'lamp'
  | 'bombos' | 'ether' | 'quake'
  | 'book' | 'shovel' | 'net' | 'bottle'
  | 'agahnim.0' | 'agahnim.1' | 'rescue_zelda' | 'castle_gate'
  | `smallkey:${string}` | `bigkey:${string}`
  | `event:${string}`;

type RequirementSet = TraversalRequirement[][];

type ConnectionTransitType =
  | 'walk'
  | 'door'
  | 'passage'
  | 'hole'
  | 'staircase'
  | 'ledge'
  | 'mirror'
  | 'flute'
  | 'dungeon_enter'
  | 'dungeon_exit'
  | 'whirlpool'
  | 'warp_tile';

interface NavObstacle {
  position: { row: number; col: number };
  tileAttr: number;
  type: 'bush' | 'light_rock' | 'dark_rock' | 'hammer_peg' | 'bonk_rock'
    | 'deep_water' | 'bombable_wall' | 'hookshot_gap' | 'spike_floor';
  requirements: RequirementSet;
  gatesPoint?: string;
}

interface NavFeature {
  type: 'hookshot_target' | 'ledge_drop' | 'fairy_fountain' | 'flute_landing'
    | 'torch' | 'switch_crystal' | 'push_block' | 'warp_pad' | 'signpost'
    | 'npc' | 'chest' | 'heart_piece';
  position: { row: number; col: number };
  metadata?: Record<string, unknown>;
}

interface NavVariant {
  trigger: 'agahnim.0' | 'agahnim.1' | 'rain_ended' | 'flute_activated'
    | 'smith_rescued' | 'castle_opened';
  pointsAdded?: string[];
  pointsRemoved?: string[];
  description?: string;
}

interface RegionNavData {
  totalTiles: number;
  freeTileCount: number;
  maxReachableTileCount: number;
  connectionPointIds: string[];
  obstacles: NavObstacle[];
  features: NavFeature[];
  variants?: NavVariant[];
}

interface ConnectionPointData {
  id: string;
  direction?: 'n' | 's' | 'e' | 'w';
  tiles: number[];
  requirements: RequirementSet;
  position?: { row: number; col: number };
  entranceIndex?: number;
  oneWay: null | 'exit' | 'enter';
}

interface ConnectionNavData {
  transitType: ConnectionTransitType;
  requirements: RequirementSet;
  fromPoint?: ConnectionPointData;
  overlapTiles?: number[];
  weight: number;
  validAfter?: string;
  invalid?: boolean;
}

export type {
  ConnectionNavData, ConnectionPointData, ConnectionTransitType, NavFeature, NavObstacle, NavVariant,
  RegionNavData, RequirementSet, TraversalRequirement,
};
