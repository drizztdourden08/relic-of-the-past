/* @layer shared-game @kind types */
type TileReq =
  | 'lift.1'
  | 'lift.2'
  | 'lift.3'
  | 'hammer'
  | 'boots'
  | 'flippers'
  | 'hookshot'
  | 'bombs';

type TileLabel =
  | 'ground' | 'floor' | 'stair' | 'outdoor ground'
  | 'tall grass' | 'thick grass' | 'cuttable'
  | 'diggable' | 'shovel target'
  | 'shallow water' | 'water ladder'
  | 'ground overlay'
  | 'slope south' | 'slope north' | 'slope east' | 'slope west'
  | 'wall' | 'plaque'
  | 'cliff face south' | 'cliff face north' | 'cliff face east' | 'cliff face west'
  | 'cliff edge south' | 'cliff edge north' | 'cliff edge east' | 'cliff edge west'
  | 'ledge y axis' | 'ledge x axis'
  | 'ledge north' | 'ledge south' | 'ledge east' | 'ledge west'
  | 'ledge NE' | 'ledge SE' | 'ledge NW' | 'ledge SW'
  | 'deep water'
  | 'pit' | 'hole'
  | 'hookshot post' | 'grapple point' | 'hookshot-grabbable'
  | 'bush' | 'sign' | 'pot' | 'pushable block'
  | 'light rock' | 'dark rock'
  | 'hammer peg'
  | 'bonk rock' | 'dash target'
  | 'door passage' | 'shutter door' | 'entrance'
  | 'torch' | 'flaggable door' | 'bombable wall';

type TilePass = 'free' | 'obstacle' | 'blocked' | 'water' | 'pit';

type TileCat =
  | 'ground'
  | 'slope'
  | 'wall'
  | 'water'
  | 'cliff-face'
  | 'cliff-trigger'
  | 'stairs'
  | 'liftable'
  | 'special'
  | 'pit';

interface TileAttrDef {
  pass: TilePass;
  req?: TileReq;
  labels: [TileLabel, ...TileLabel[]];
  cat: TileCat;
  hookTarget?: true;
}

type TileBehavior =
  | 'nothing' | 'standard-collision'
  | 'deep-water' | 'shallow-water' | 'short-water-ladder'
  | 'moving-floor' | 'spike-floor' | 'ganon-ice' | 'palace-ice'
  | 'slope' | 'slope-outer' | 'water-staircase'
  | 'stairs-single-layer' | 'stairs-swap-layer' | 'stairs-visible'
  | 'indoor-stairs-3e'
  | 'pit' | 'hookshottable'
  | 'ledge-north' | 'ledge-south' | 'ledge-east-west'
  | 'ledge-north-diagonal' | 'ledge-south-diagonal'
  | 'thick-grass' | 'gravestone' | 'spike' | 'hylian-plaque'
  | 'diggable-ground' | 'warp' | 'unused-corner' | 'eastern-ruins-corner'
  | 'liftable' | 'bonk-rocks' | 'chest' | 'rupee-tile' | 'minigame-chest'
  | 'crystal-peg-up'
  | 'conveyor-up' | 'conveyor-down' | 'conveyor-left' | 'conveyor-right'
  | 'manipulably-replaced'
  | 'indoor-door-80' | 'indoor-door-82' | 'entrance'
  | 'layer-toggle-shutter' | 'layer-dungeon-toggle-shutter'
  | 'dungeon-toggle-manual-door' | 'dungeon-toggle-shutter'
  | 'lightable-torch' | 'flaggable-door';

type TileVisual =
  | 'ground' | 'floor' | 'stair-steps' | 'thick-grass' | 'shallow-water' | 'deep-water'
  | 'water-ladder' | 'ice' | 'wall' | 'plaque' | 'gravestone' | 'spikes'
  | 'cliff-face' | 'cliff-edge' | 'ledge' | 'pit' | 'diggable-patch' | 'warp-tile'
  | 'bush' | 'sign' | 'pot' | 'light-rock' | 'dark-rock' | 'bonk-rock' | 'hammer-peg'
  | 'crystal-peg' | 'pushable-block' | 'chest' | 'conveyor' | 'rupee-floor'
  | 'door-frame' | 'shutter' | 'entrance-mat' | 'torch-sconce' | 'flaggable-wall'
  | 'hookshot-post';

export type {
  TileReq, TileLabel, TilePass, TileCat, TileAttrDef,
  TileBehavior, TileVisual,
};
