/* @layer shared-game @kind types */
/** Derived from tile_detect.c TileDetect_ExecuteInner(). */

/** Equipment requirement keys. Editing this union makes the compiler flag every incomplete consumer. */
type TileReq =
  | 'lift.1'     // bare hands, for bush, pot, sign
  | 'lift.2'     // glove tier 1: light rocks
  | 'lift.3'     // glove tier 2: dark rocks
  | 'hammer'     // hammer: pegs
  | 'boots'      // dash boots: bonk rocks
  | 'flippers'   // the swimming item, for deep water
  | 'hookshot'   // grapple across gaps (hookshot posts)
  | 'bombs';     // blast open cracked/bombable walls

/** What a tile "is" or "does". A single tile byte can map to several labels (equivalences). */
type TileLabel =
  // Ground / walkable
  | 'ground' | 'floor' | 'stair' | 'outdoor ground'
  | 'tall grass' | 'thick grass' | 'cuttable'
  | 'diggable' | 'shovel target'
  | 'shallow water' | 'water ladder'
  | 'ground overlay'
  // Slopes
  | 'slope south' | 'slope north' | 'slope east' | 'slope west'
  // Walls / solid
  | 'wall' | 'plaque'
  // Cliffs
  | 'cliff face south' | 'cliff face north' | 'cliff face east' | 'cliff face west'
  | 'cliff edge south' | 'cliff edge north' | 'cliff edge east' | 'cliff edge west'
  // Ledges (directional jump triggers)
  | 'ledge y axis' | 'ledge x axis'
  | 'ledge north' | 'ledge south' | 'ledge east' | 'ledge west'
  | 'ledge NE' | 'ledge SE' | 'ledge NW' | 'ledge SW'
  // Water
  | 'deep water'
  // Pit
  | 'pit' | 'hole'
  // Special / interactive
  | 'hookshot post' | 'grapple point' | 'hookshot-grabbable'
  // Liftable obstacles
  | 'bush' | 'sign' | 'pot' | 'pushable block'
  | 'light rock' | 'dark rock'
  | 'hammer peg'
  | 'bonk rock' | 'dash target'
  // Doors / transitions (interior)
  | 'door passage' | 'shutter door' | 'entrance'
  | 'torch' | 'flaggable door' | 'bombable wall';

/** Navigation passability for flood fill */
type TilePass = 'free' | 'obstacle' | 'blocked' | 'water' | 'pit';

/** Semantic category for grouping / filtering */
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
  /** How the flood fill treats this tile */
  pass: TilePass;
  /** Equipment needed to traverse (only when pass !== 'free') */
  req?: TileReq;
  /** Human-readable names. The first is primary, the rest are equivalences */
  labels: [TileLabel, ...TileLabel[]];
  /** Semantic category for grouping */
  cat: TileCat;
  /** True if the hookshot can grab this tile (pulls the player to it from range) */
  hookTarget?: true;
}

/**
 * Mechanical consequence of a tile, one member per case in TileDetect_ExecuteInner
 * (core/zelda3/src/tile_detect.c:261-526). The names ARE the engine's own
 * TileBehavior_* comment names, so conformance can be checked by eye.
 */
type TileBehavior =
  | 'nothing' | 'standard-collision'
  | 'deep-water' | 'shallow-water' | 'short-water-ladder'
  | 'moving-floor' | 'spike-floor' | 'ganon-ice' | 'palace-ice'
  | 'slope' | 'slope-outer' | 'water-staircase'
  | 'stairs-single-layer' | 'stairs-swap-layer' | 'stairs-visible'
  // A FIFTH staircase case (TileHandlerIndoor_3E, tile_detect.c:366) with no name of
  // its own: it raises the in-room staircase flag in the high nibble, which routes
  // to a different submodule than 'stairs-single-layer'. Named after the handler.
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

/**
 * What a tile IS, for the label a person reads. Separate from TileBehavior on
 * purpose: two tiles can share a behavior and look nothing alike, and a
 * readable label must never pass for the engine's own classification.
 */
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
