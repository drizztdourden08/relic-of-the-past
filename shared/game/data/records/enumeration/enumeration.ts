/* @layer shared-game @kind data */
/**
 * One row per possible value of each closed-set label category. The
 * underlying record fields these describe stay plain literals (a
 * `ScreenRecord.world` is still `'light' | 'dark'`). This is an additional
 * label/registry source, not a foreign key.
 */
import type { EntityKind } from '@shared/game/data/types/ids';
import type { EnumerationEntry } from '@shared/game/data/types/enumeration';

/**
 * Every collection kind, hand-kept in step with `KIND_ID_PREFIXES` (../types/ids)
 * instead of imported from it. This module's only imports may be `import type`
 * (erased at parse time), because `generate-enum-types.mjs` loads this file
 * directly with Node's native TS stripping, with no bundler to resolve an
 * extensionless runtime import.
 */
const ALL_KINDS: readonly EntityKind[] = [
  'screen', 'connection', 'check', 'item', 'dungeon', 'area', 'location', 'actor', 'tag',
  'item-group', 'enumeration',
];

const ALL_ENUMERATION: EnumerationEntry[] = [
  // world is reused by both ScreenRecord.world (light/dark) and the 3-value
  // AreaRecord.world (light/dark/both, e.g. the mountain area).
  { id: 'enum-001', category: 'world', value: 'light', label: 'Light World', appliesTo: ['screen', 'area'] },
  { id: 'enum-002', category: 'world', value: 'dark', label: 'Dark World', appliesTo: ['screen', 'area'] },
  { id: 'enum-003', category: 'world', value: 'both', label: 'Both Worlds', appliesTo: ['screen', 'area'] },

  // screen-kind
  { id: 'enum-007', category: 'screen-kind', value: 'overworld', label: 'Overworld', appliesTo: ['screen'] },
  { id: 'enum-008', category: 'screen-kind', value: 'dungeon', label: 'Dungeon', appliesTo: ['screen'] },
  { id: 'enum-009', category: 'screen-kind', value: 'interior', label: 'Interior', appliesTo: ['screen'] },

  // interior-kind
  { id: 'enum-010', category: 'interior-kind', value: 'house', label: 'House', appliesTo: ['screen'] },
  { id: 'enum-011', category: 'interior-kind', value: 'cave', label: 'Cave', appliesTo: ['screen'] },
  { id: 'enum-012', category: 'interior-kind', value: 'shop', label: 'Shop', appliesTo: ['screen'] },
  { id: 'enum-013', category: 'interior-kind', value: 'fairy', label: 'Fairy Fountain', appliesTo: ['screen'] },
  { id: 'enum-014', category: 'interior-kind', value: 'well', label: 'Well', appliesTo: ['screen'] },
  { id: 'enum-015', category: 'interior-kind', value: 'passage', label: 'Passage', appliesTo: ['screen'] },
  { id: 'enum-016', category: 'interior-kind', value: 'hint', label: 'Hint', appliesTo: ['screen'] },
  { id: 'enum-017', category: 'interior-kind', value: 'gamble', label: 'Game of Chance', appliesTo: ['screen'] },
  { id: 'enum-018', category: 'interior-kind', value: 'special', label: 'Special', appliesTo: ['screen'] },

  // connection-kind holds the transitions the game itself performs, each
  // taking control away from the player to move them between screens.
  // Everything else the old `transit:*` vocabulary named (walk, swim, ledge,
  // waterfall, grave, bomb, bonk, rock, push, hookshot) is HOW you reach or
  // clear a crossing, not the crossing itself, so those stay tags.
  // edge: scroll across a boundary (overworld border, big-room section boundary).
  // door: room ↔ room doorway. Shutter/key/bomb doors are the SAME kind, gated.
  // entrance: overworld ↔ interior threshold (the entranceId / exitId pair).
  // stairs: inter-room / inter-floor staircase (the native stair table).
  // hole: any fall-through, either a pit to the room below or an overworld hole into a cave.
  // drop: the LANDING side of a hole. The flood already reads it (a fall hole's
  //   entrance id resolves to a spawn tile, which is where the player touches
  //   down), and it is a real connection point even though nothing can leave
  //   through it: a ceiling is not a door. Its pair partner is always a `hole`.
  // teleport: warp tiles, whirlpools, cross-world portals.
  { id: 'enum-019', category: 'connection-kind', value: 'edge', label: 'Edge', appliesTo: ['connection'] },
  { id: 'enum-020', category: 'connection-kind', value: 'door', label: 'Door', appliesTo: ['connection'] },
  { id: 'enum-021', category: 'connection-kind', value: 'entrance', label: 'Entrance', appliesTo: ['connection'] },
  { id: 'enum-022', category: 'connection-kind', value: 'stairs', label: 'Stairs', appliesTo: ['connection'] },
  { id: 'enum-023', category: 'connection-kind', value: 'hole', label: 'Hole', appliesTo: ['connection'] },
  { id: 'enum-063', category: 'connection-kind', value: 'drop', label: 'Drop', appliesTo: ['connection'] },
  { id: 'enum-024', category: 'connection-kind', value: 'teleport', label: 'Teleport', appliesTo: ['connection'] },

  // connection-side
  { id: 'enum-025', category: 'connection-side', value: 'north', label: 'North', appliesTo: ['connection'] },
  { id: 'enum-026', category: 'connection-side', value: 'south', label: 'South', appliesTo: ['connection'] },
  { id: 'enum-027', category: 'connection-side', value: 'east', label: 'East', appliesTo: ['connection'] },
  { id: 'enum-028', category: 'connection-side', value: 'west', label: 'West', appliesTo: ['connection'] },
  { id: 'enum-029', category: 'connection-side', value: 'up', label: 'Up', appliesTo: ['connection'] },
  { id: 'enum-030', category: 'connection-side', value: 'down', label: 'Down', appliesTo: ['connection'] },

  // actor-kind
  { id: 'enum-031', category: 'actor-kind', value: 'enemy', label: 'Enemy', appliesTo: ['actor'] },
  { id: 'enum-032', category: 'actor-kind', value: 'boss', label: 'Boss', appliesTo: ['actor'] },
  { id: 'enum-033', category: 'actor-kind', value: 'npc', label: 'NPC', appliesTo: ['actor'] },
  { id: 'enum-034', category: 'actor-kind', value: 'object', label: 'Object', appliesTo: ['actor'] },
  { id: 'enum-035', category: 'actor-kind', value: 'obstacle', label: 'Obstacle', appliesTo: ['actor'] },
  { id: 'enum-036', category: 'actor-kind', value: 'trigger', label: 'Trigger', appliesTo: ['actor'] },

  // check-kind
  { id: 'enum-037', category: 'check-kind', value: 'chest', label: 'Chest', appliesTo: ['check'] },
  { id: 'enum-038', category: 'check-kind', value: 'npc', label: 'NPC', appliesTo: ['check'] },
  { id: 'enum-039', category: 'check-kind', value: 'standing', label: 'Standing Item', appliesTo: ['check'] },
  { id: 'enum-040', category: 'check-kind', value: 'boss', label: 'Boss', appliesTo: ['check'] },
  { id: 'enum-041', category: 'check-kind', value: 'prize', label: 'Prize', appliesTo: ['check'] },
  { id: 'enum-042', category: 'check-kind', value: 'keyDrop', label: 'Key Drop', appliesTo: ['check'] },
  { id: 'enum-043', category: 'check-kind', value: 'potItem', label: 'Pot Item', appliesTo: ['check'] },
  { id: 'enum-044', category: 'check-kind', value: 'dig', label: 'Dig Spot', appliesTo: ['check'] },
  { id: 'enum-045', category: 'check-kind', value: 'bonk', label: 'Bonk Item', appliesTo: ['check'] },
  { id: 'enum-046', category: 'check-kind', value: 'event', label: 'Event', appliesTo: ['check'] },

  // item-category labels are reused verbatim from taxonomy/item-categories.ts's ITEM_CATEGORY_LABELS.
  { id: 'enum-047', category: 'item-category', value: 'weapon', label: 'Weapon', appliesTo: ['item'] },
  { id: 'enum-048', category: 'item-category', value: 'equipment', label: 'Equipment', appliesTo: ['item'] },
  { id: 'enum-049', category: 'item-category', value: 'medallion', label: 'Medallion', appliesTo: ['item'] },
  { id: 'enum-050', category: 'item-category', value: 'bottle', label: 'Bottle', appliesTo: ['item'] },
  { id: 'enum-051', category: 'item-category', value: 'upgrade', label: 'Upgrade', appliesTo: ['item'] },
  { id: 'enum-052', category: 'item-category', value: 'crystal', label: 'Crystal', appliesTo: ['item'] },
  { id: 'enum-053', category: 'item-category', value: 'event', label: 'Event', appliesTo: ['item'] },
  { id: 'enum-054', category: 'item-category', value: 'junk', label: 'Junk', appliesTo: ['item'] },
  { id: 'enum-055', category: 'item-category', value: 'key', label: 'Key', appliesTo: ['item'] },

  // item-origin
  { id: 'enum-056', category: 'item-origin', value: 'vanilla', label: 'Vanilla', appliesTo: ['item'] },
  { id: 'enum-057', category: 'item-origin', value: 'randomizer', label: 'Randomizer', appliesTo: ['item'] },

  // progress-tier holds the four values of the save's progress indicator byte,
  // the one the engine branches on for sprite lists, ambient sound, sign text
  // and world access (core/zelda3/src/overworld.c:302-306 is the clearest
  // table). The field this labels (`ScreenVariantInfo.progressTier`) holds the
  // NUMBER. The values here are that number written as text, because an
  // enumeration value is a string by definition. That is also why this
  // category is absent from `CATEGORY_TYPE_NAMES` in
  // scripts/generate-enum-types.mjs: a numeric field must not be retyped to a
  // union of string literals. See shared/game/logic/queries/progress-tier.ts
  // for what each tier means and where in the C each one is set.
  { id: 'enum-064', category: 'progress-tier', value: '0', label: 'Before the sword', appliesTo: ['screen'] },
  { id: 'enum-065', category: 'progress-tier', value: '1', label: 'Sword received', appliesTo: ['screen'] },
  { id: 'enum-066', category: 'progress-tier', value: '2', label: 'Princess delivered', appliesTo: ['screen'] },
  { id: 'enum-067', category: 'progress-tier', value: '3', label: 'Tower boss defeated', appliesTo: ['screen'] },

  // review-status is the personal curation layer's status pill (see
  // shared/game/review/types.ts). It is not a field on any record itself (it
  // lives in Data/review/<kind>.json, never in the committed dataset), but it
  // is a real category in this same registry, because the review UI's dropdown
  // reads it exactly like any other enum field would. Applies to all eleven
  // collections, in the natural untouched → verified progression.
  { id: 'enum-058', category: 'review-status', value: 'untouched', label: 'Untouched', appliesTo: ALL_KINDS },
  { id: 'enum-059', category: 'review-status', value: 'in-review', label: 'In Review', appliesTo: ALL_KINDS },
  { id: 'enum-060', category: 'review-status', value: 'needs-work', label: 'Needs Work', appliesTo: ALL_KINDS },
  { id: 'enum-061', category: 'review-status', value: 'accepted', label: 'Accepted', appliesTo: ALL_KINDS },
  { id: 'enum-062', category: 'review-status', value: 'verified', label: 'Verified', appliesTo: ALL_KINDS },
];

export { ALL_ENUMERATION };
