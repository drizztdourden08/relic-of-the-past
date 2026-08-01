/* @layer shared-game @kind data */
/**
 * Screen tag taxonomy — our own invented vocabulary for categorizing every
 * location, not a game secret. Ported from data/screens/tags.ts verbatim;
 * only the metadata table lives here, the query helpers moved to logic/queries.
 */

type EnvironmentTag = 'env:outdoor' | 'env:indoor' | 'env:underground' | 'env:water';

type RoleTag =
  | 'role:entrance' | 'role:boss' | 'role:pre-boss' | 'role:mini-boss'
  | 'role:hub' | 'role:dead-end' | 'role:connector' | 'role:stairwell'
  | 'role:safe' | 'role:spawn' | 'role:puzzle';

type HazardTag =
  | 'hazard:dark' | 'hazard:pits' | 'hazard:water' | 'hazard:spikes'
  | 'hazard:conveyor' | 'hazard:fire' | 'hazard:ice' | 'hazard:bumpers';

type LootTag =
  | 'loot:chest' | 'loot:standing' | 'loot:boss-drop' | 'loot:npc'
  | 'loot:pot' | 'loot:dig' | 'loot:bonk';

type TraversalTag =
  | 'traverse:hookshot' | 'traverse:swim' | 'traverse:hammer' | 'traverse:bomb'
  | 'traverse:dash' | 'traverse:lift-light' | 'traverse:lift-dark'
  | 'traverse:mirror' | 'traverse:warp' | 'traverse:fall';

type ScreenTag = EnvironmentTag | RoleTag | HazardTag | LootTag | TraversalTag;

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
  { id: 'env:outdoor', label: 'Outdoor', namespace: 'env' },
  { id: 'env:indoor', label: 'Indoor', namespace: 'env' },
  { id: 'env:underground', label: 'Underground', namespace: 'env' },
  { id: 'env:water', label: 'Water', namespace: 'env' },
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
  { id: 'hazard:dark', label: 'Dark', namespace: 'hazard' },
  { id: 'hazard:pits', label: 'Pits', namespace: 'hazard' },
  { id: 'hazard:water', label: 'Deep Water', namespace: 'hazard' },
  { id: 'hazard:spikes', label: 'Spikes', namespace: 'hazard' },
  { id: 'hazard:conveyor', label: 'Conveyor', namespace: 'hazard' },
  { id: 'hazard:fire', label: 'Fire', namespace: 'hazard' },
  { id: 'hazard:ice', label: 'Ice Floor', namespace: 'hazard' },
  { id: 'hazard:bumpers', label: 'Bumpers', namespace: 'hazard' },
  { id: 'loot:chest', label: 'Chest', namespace: 'loot' },
  { id: 'loot:standing', label: 'Standing Item', namespace: 'loot' },
  { id: 'loot:boss-drop', label: 'Boss Drop', namespace: 'loot' },
  { id: 'loot:npc', label: 'NPC Gift', namespace: 'loot' },
  { id: 'loot:pot', label: 'Pot Item', namespace: 'loot' },
  { id: 'loot:dig', label: 'Dig Spot', namespace: 'loot' },
  { id: 'loot:bonk', label: 'Bonk Item', namespace: 'loot' },
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
export type { EnvironmentTag, HazardTag, LootTag, RoleTag, ScreenTag, TagMetadata, TagNamespace, TraversalTag };
