/* @layer shared-game @kind types */
/**
 * Tile attribute type definitions — shared by the attr maps and helpers.
 * Derived from zelda3 source: tile_detect.c TileDetect_ExecuteInner().
 */

/**
 * Equipment requirement keys.
 * Modify this union to add/remove supported requirements —
 * the compiler will flag all incomplete consumers.
 */
type TileReq =
  | 'lift.1'     // bare hands — bush, pot, sign
  | 'lift.2'     // Power Glove — light rocks
  | 'lift.3'     // Titan's Mitt — dark rocks
  | 'hammer'     // Magic Hammer — pegs
  | 'boots'      // Pegasus Boots — bonk rocks
  | 'flippers'   // Zora's Flippers — deep water
  | 'hookshot'   // Hookshot — grapple across gaps (hookshot posts)
  | 'bombs';     // Bombs — blast open cracked/bombable walls

/**
 * Semantic labels — exhaustive set describing what a tile "is" or "does".
 * A single tile byte can map to multiple labels (equivalences).
 */
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

/** Tile attribute context for classification rules. */
type TileAttrContext = 'overworld' | 'interior-house' | 'interior-cave' | 'interior-dungeon';

interface TileAttrDef {
  /** How the flood fill treats this tile */
  pass: TilePass;
  /** Equipment needed to traverse (only when pass !== 'free') */
  req?: TileReq;
  /** Human-readable names — first is primary, rest are equivalences */
  labels: [TileLabel, ...TileLabel[]];
  /** Semantic category for grouping */
  cat: TileCat;
  /** True if the hookshot can grab this tile (pulls Link to it from range) */
  hookTarget?: true;
}

export type { TileReq, TileLabel, TilePass, TileCat, TileAttrContext, TileAttrDef };
