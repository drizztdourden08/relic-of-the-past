/**
 * Connection Tag System — Categorizes how regions are connected.
 *
 * Tags use the same namespaced "namespace:value" format as region tags.
 */

// ─── Tag Namespace Definitions ───

/** Physical mechanism of traversal */
type TransitTag =
  | 'transit:door'        // walk through a standard door opening
  | 'transit:hole'        // fall through a hole in the ground/floor
  | 'transit:ledge'       // one-way drop off a cliff/ledge
  | 'transit:stairs'      // staircase or ladder
  | 'transit:warp'        // teleporter / flute / warp tile
  | 'transit:mirror'      // magic mirror reflection
  | 'transit:waterfall'   // enter through / behind a waterfall
  | 'transit:walk'        // seamless area transition (no visible threshold)
  | 'transit:swim'        // swim or dive through water
  | 'transit:grave'       // push a tombstone to reveal entrance
  | 'transit:bomb'        // bomb wall/floor to open passage
  | 'transit:bonk'        // pegasus boots dash/bonk entry
  | 'transit:rock'        // lift a rock to reveal entrance
  | 'transit:push'        // push a block to open passage
  | 'transit:hookshot';   // hookshot across a gap

/** What blocks passage (barrier/lock) */
type BarrierTag =
  | 'barrier:none'        // always accessible
  | 'barrier:small-key'   // dungeon small key
  | 'barrier:big-key'     // dungeon big key
  | 'barrier:bomb'        // bombable wall/floor
  | 'barrier:gloves'      // requires lifting rocks (power gloves / titan's mitt)
  | 'barrier:hammer'      // hammer pegs
  | 'barrier:dark'        // dark room (lamp needed to navigate)
  | 'barrier:medallion'   // requires a medallion to open
  | 'barrier:crystals'    // requires N crystals
  | 'barrier:event'       // story progression event
  | 'barrier:dash'        // pegasus boots required
  | 'barrier:hookshot'    // hookshot required to cross
  | 'barrier:swim'        // flippers required
  | 'barrier:fire'        // fire source needed (fire rod or lamp)
  | 'barrier:book'        // Book of Mudora required
  | 'barrier:glitch';     // requires a glitch to access

/** Directionality of the connection */
type DirectionTag =
  | 'dir:one-way'         // can only traverse in one direction
  | 'dir:two-way';        // bidirectional passage

/** Functional context / purpose */
type ContextTag =
  | 'ctx:entrance'        // entering a building/cave/dungeon from overworld
  | 'ctx:exit'            // leaving back to overworld
  | 'ctx:internal'        // room-to-room within a location
  | 'ctx:cross-world'     // light ↔ dark world transition
  | 'ctx:save-quit'       // save & quit warp destination
  | 'ctx:boss'            // door leading to boss fight
  | 'ctx:overworld'       // overworld area-to-area transition
  | 'ctx:dungeon-enter'   // entering a dungeon from overworld
  | 'ctx:shortcut';       // secret/shortcut connection

/** All valid connection tags */
type ConnectionTag =
  | TransitTag
  | BarrierTag
  | DirectionTag
  | ContextTag;

export type {
  BarrierTag,
  ConnectionTag,
  ContextTag,
  DirectionTag,
  TransitTag,
};

// ─── Tag Metadata (for UI display & filtering) ───

interface ConnectionTagMetadata {
  id: ConnectionTag;
  label: string;
  namespace: 'transit' | 'barrier' | 'dir' | 'ctx';
}

const CONNECTION_TAG_METADATA: ConnectionTagMetadata[] = [
  // Transit
  { id: 'transit:door', label: 'Door', namespace: 'transit' },
  { id: 'transit:hole', label: 'Hole / Drop-in', namespace: 'transit' },
  { id: 'transit:ledge', label: 'Ledge Drop', namespace: 'transit' },
  { id: 'transit:stairs', label: 'Stairs', namespace: 'transit' },
  { id: 'transit:warp', label: 'Warp / Teleporter', namespace: 'transit' },
  { id: 'transit:mirror', label: 'Magic Mirror', namespace: 'transit' },
  { id: 'transit:waterfall', label: 'Waterfall', namespace: 'transit' },
  { id: 'transit:walk', label: 'Walk', namespace: 'transit' },
  { id: 'transit:swim', label: 'Swim', namespace: 'transit' },
  { id: 'transit:grave', label: 'Grave Push', namespace: 'transit' },
  { id: 'transit:bomb', label: 'Bomb Wall', namespace: 'transit' },
  { id: 'transit:bonk', label: 'Bonk / Dash', namespace: 'transit' },
  { id: 'transit:rock', label: 'Rock Lift', namespace: 'transit' },
  { id: 'transit:push', label: 'Push Block', namespace: 'transit' },
  { id: 'transit:hookshot', label: 'Hookshot', namespace: 'transit' },

  // Barrier
  { id: 'barrier:none', label: 'No Barrier', namespace: 'barrier' },
  { id: 'barrier:small-key', label: 'Small Key', namespace: 'barrier' },
  { id: 'barrier:big-key', label: 'Big Key', namespace: 'barrier' },
  { id: 'barrier:bomb', label: 'Bomb', namespace: 'barrier' },
  { id: 'barrier:gloves', label: 'Gloves', namespace: 'barrier' },
  { id: 'barrier:hammer', label: 'Hammer', namespace: 'barrier' },
  { id: 'barrier:dark', label: 'Dark Room', namespace: 'barrier' },
  { id: 'barrier:medallion', label: 'Medallion', namespace: 'barrier' },
  { id: 'barrier:crystals', label: 'Crystals', namespace: 'barrier' },
  { id: 'barrier:event', label: 'Event', namespace: 'barrier' },
  { id: 'barrier:dash', label: 'Dash / Boots', namespace: 'barrier' },
  { id: 'barrier:hookshot', label: 'Hookshot', namespace: 'barrier' },
  { id: 'barrier:swim', label: 'Swim / Flippers', namespace: 'barrier' },
  { id: 'barrier:fire', label: 'Fire Source', namespace: 'barrier' },
  { id: 'barrier:book', label: 'Book of Mudora', namespace: 'barrier' },

  // Direction
  { id: 'dir:one-way', label: 'One-Way', namespace: 'dir' },
  { id: 'dir:two-way', label: 'Two-Way', namespace: 'dir' },

  // Context
  { id: 'ctx:entrance', label: 'Entrance', namespace: 'ctx' },
  { id: 'ctx:exit', label: 'Exit', namespace: 'ctx' },
  { id: 'ctx:internal', label: 'Internal', namespace: 'ctx' },
  { id: 'ctx:cross-world', label: 'Cross-World', namespace: 'ctx' },
  { id: 'ctx:save-quit', label: 'Save & Quit', namespace: 'ctx' },
  { id: 'ctx:boss', label: 'Boss Door', namespace: 'ctx' },
  { id: 'ctx:overworld', label: 'Overworld', namespace: 'ctx' },
  { id: 'ctx:dungeon-enter', label: 'Dungeon Entrance', namespace: 'ctx' },
  { id: 'ctx:shortcut', label: 'Shortcut', namespace: 'ctx' },
];

export { CONNECTION_TAG_METADATA };
export type { ConnectionTagMetadata };
