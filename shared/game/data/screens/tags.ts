/**
 * Screen Tag System — Single source of truth for categorizing every location
 * in A Link to the Past.
 *
 * Tags use a namespaced format: "namespace:value"
 *
 * IMPORTANT: Tags should only encode information that is NOT already present in
 * the structured ScreenDefinition fields (type, world, area, dungeon.palaceIndex, interior.kind).
 * Tags are for gameplay-relevant metadata: environment, role, hazards, loot, traversal.
 */

// ─── Tag Namespace Definitions ───

/** Physical environment / atmosphere of the room */
type EnvironmentTag =
  | 'env:outdoor'       // open-air (overworld, rooftops)
  | 'env:indoor'        // enclosed buildings (houses, shops, temples)
  | 'env:underground'   // subterranean (caves, wells, sewers, dungeons)
  | 'env:water';        // aquatic/waterlogged areas

/** Functional role of the room in game progression */
type RoleTag =
  | 'role:entrance'     // entry point to a dungeon or building
  | 'role:boss'         // boss fight arena
  | 'role:pre-boss'     // final room before boss
  | 'role:mini-boss'    // mini-boss encounter room
  | 'role:hub'          // major branching point / intersection
  | 'role:dead-end'     // single-exit room (terminal)
  | 'role:connector'    // passage linking two areas
  | 'role:stairwell'    // vertical connector between floors
  | 'role:safe'         // no enemies (sanctuaries, houses)
  | 'role:spawn'        // save & quit / respawn destination
  | 'role:puzzle';      // room with key puzzle mechanics

/** Environmental hazards present in the room */
type HazardTag =
  | 'hazard:dark'       // requires lamp to see
  | 'hazard:pits'       // bottomless pits / fall hazards
  | 'hazard:water'      // deep water requiring swim
  | 'hazard:spikes'     // spike traps
  | 'hazard:conveyor'   // conveyor belts
  | 'hazard:fire'       // fire bars / fire hazards
  | 'hazard:ice'        // slippery ice floor
  | 'hazard:bumpers';   // crystal bumpers

/** Loot / collectibles available in the room */
type LootTag =
  | 'loot:chest'        // treasure chest(s)
  | 'loot:standing'     // standing item (heart piece, key, etc.)
  | 'loot:boss-drop'    // boss defeat reward
  | 'loot:npc'          // NPC gift / quest reward
  | 'loot:pot'          // pot drops (key under pot, etc.)
  | 'loot:dig'          // dig spot
  | 'loot:bonk';        // bonk item (tree, wall)

/** Traversal requirements / mechanics in the room */
type TraversalTag =
  | 'traverse:hookshot'   // hookshot needed/usable
  | 'traverse:swim'       // flippers required
  | 'traverse:hammer'     // hammer needed
  | 'traverse:bomb'       // bombable walls/floors
  | 'traverse:dash'       // pegasus boots needed
  | 'traverse:lift-light' // power glove lift
  | 'traverse:lift-dark'  // titan's mitt lift
  | 'traverse:mirror'     // magic mirror point
  | 'traverse:warp'       // warp tile present
  | 'traverse:fall';      // one-way fall entry/exit

/** All valid screen tags */
type ScreenTag =
  | EnvironmentTag
  | RoleTag
  | HazardTag
  | LootTag
  | TraversalTag;

export type {
  EnvironmentTag,
  HazardTag,
  LootTag,
  ScreenTag,
  RoleTag,
  TraversalTag,
};

// ─── Tag Metadata (for UI display & filtering) ───

type TagNamespace = 'env' | 'role' | 'hazard' | 'loot' | 'traverse';

interface TagMetadata {
  id: ScreenTag;
  label: string;
  namespace: TagNamespace;
}

const TAG_NAMESPACES: { id: TagNamespace; label: string }[] = [
  { id: 'env', label: 'Environment' },
  { id: 'role', label: 'Room Role' },
  { id: 'hazard', label: 'Hazards' },
  { id: 'loot', label: 'Loot' },
  { id: 'traverse', label: 'Traversal' },
];

const TAG_METADATA: TagMetadata[] = [
  // Environment
  { id: 'env:outdoor', label: 'Outdoor', namespace: 'env' },
  { id: 'env:indoor', label: 'Indoor', namespace: 'env' },
  { id: 'env:underground', label: 'Underground', namespace: 'env' },
  { id: 'env:water', label: 'Water', namespace: 'env' },

  // Role
  { id: 'role:entrance', label: 'Entrance', namespace: 'role' },
  { id: 'role:boss', label: 'Boss', namespace: 'role' },
  { id: 'role:pre-boss', label: 'Pre-Boss', namespace: 'role' },
  { id: 'role:mini-boss', label: 'Mini-Boss', namespace: 'role' },
  { id: 'role:hub', label: 'Hub', namespace: 'role' },
  { id: 'role:dead-end', label: 'Dead End', namespace: 'role' },
  { id: 'role:connector', label: 'Connector', namespace: 'role' },
  { id: 'role:stairwell', label: 'Stairwell', namespace: 'role' },
  { id: 'role:safe', label: 'Safe Zone', namespace: 'role' },
  { id: 'role:spawn', label: 'Spawn Point', namespace: 'role' },
  { id: 'role:puzzle', label: 'Puzzle', namespace: 'role' },

  // Hazards
  { id: 'hazard:dark', label: 'Dark', namespace: 'hazard' },
  { id: 'hazard:pits', label: 'Pits', namespace: 'hazard' },
  { id: 'hazard:water', label: 'Deep Water', namespace: 'hazard' },
  { id: 'hazard:spikes', label: 'Spikes', namespace: 'hazard' },
  { id: 'hazard:conveyor', label: 'Conveyor', namespace: 'hazard' },
  { id: 'hazard:fire', label: 'Fire', namespace: 'hazard' },
  { id: 'hazard:ice', label: 'Ice Floor', namespace: 'hazard' },
  { id: 'hazard:bumpers', label: 'Bumpers', namespace: 'hazard' },

  // Loot
  { id: 'loot:chest', label: 'Chest', namespace: 'loot' },
  { id: 'loot:standing', label: 'Standing Item', namespace: 'loot' },
  { id: 'loot:boss-drop', label: 'Boss Drop', namespace: 'loot' },
  { id: 'loot:npc', label: 'NPC Gift', namespace: 'loot' },
  { id: 'loot:pot', label: 'Pot Item', namespace: 'loot' },
  { id: 'loot:dig', label: 'Dig Spot', namespace: 'loot' },
  { id: 'loot:bonk', label: 'Bonk Item', namespace: 'loot' },

  // Traversal
  { id: 'traverse:hookshot', label: 'Hookshot', namespace: 'traverse' },
  { id: 'traverse:swim', label: 'Swim', namespace: 'traverse' },
  { id: 'traverse:hammer', label: 'Hammer', namespace: 'traverse' },
  { id: 'traverse:bomb', label: 'Bomb Wall', namespace: 'traverse' },
  { id: 'traverse:dash', label: 'Dash', namespace: 'traverse' },
  { id: 'traverse:lift-light', label: 'Lift (Light)', namespace: 'traverse' },
  { id: 'traverse:lift-dark', label: 'Lift (Heavy)', namespace: 'traverse' },
  { id: 'traverse:mirror', label: 'Mirror Point', namespace: 'traverse' },
  { id: 'traverse:warp', label: 'Warp Tile', namespace: 'traverse' },
  { id: 'traverse:fall', label: 'Fall Hole', namespace: 'traverse' },
];

export { TAG_METADATA, TAG_NAMESPACES };
export type { TagMetadata, TagNamespace };

// ─── Utility: query screens by tags ───

function hasAllTags(screenTags: readonly ScreenTag[], required: ScreenTag[]): boolean {
  return required.every(t => screenTags.includes(t));
}

function hasAnyTag(screenTags: readonly ScreenTag[], candidates: ScreenTag[]): boolean {
  return candidates.some(t => screenTags.includes(t));
}

function getTagNamespace(tag: ScreenTag): string {
  return tag.split(':')[0];
}

function getTagValue(tag: ScreenTag): string {
  return tag.split(':')[1];
}

export { getTagNamespace, getTagValue, hasAllTags, hasAnyTag };
