/* @layer shared-game @kind data */
/**
 * One row per possible value of each closed-set label category. The
 * underlying record fields these describe stay plain literals (a
 * `ScreenRecord.world` is still `'light' | 'dark'`) — this is purely an
 * additional label/registry source, not a foreign key.
 */
import type { EnumerationEntry } from '../types/enumeration';

const ALL_ENUMERATION: EnumerationEntry[] = [
  // ─── world — reused by both ScreenRecord.world (light/dark) and the
  // 3-value AreaRecord.world (light/dark/both, e.g. Death Mountain). ───
  { id: 'enum-001', category: 'world', value: 'light', label: 'Light World', appliesTo: ['screen', 'area'] },
  { id: 'enum-002', category: 'world', value: 'dark', label: 'Dark World', appliesTo: ['screen', 'area'] },
  { id: 'enum-003', category: 'world', value: 'both', label: 'Both Worlds', appliesTo: ['screen', 'area'] },

  // ─── screen-status ───
  { id: 'enum-004', category: 'screen-status', value: 'draft', label: 'Draft', appliesTo: ['screen'] },
  { id: 'enum-005', category: 'screen-status', value: 'mapped', label: 'Mapped', appliesTo: ['screen'] },
  { id: 'enum-006', category: 'screen-status', value: 'verified', label: 'Verified', appliesTo: ['screen'] },

  // ─── screen-kind ───
  { id: 'enum-007', category: 'screen-kind', value: 'overworld', label: 'Overworld', appliesTo: ['screen'] },
  { id: 'enum-008', category: 'screen-kind', value: 'dungeon', label: 'Dungeon', appliesTo: ['screen'] },
  { id: 'enum-009', category: 'screen-kind', value: 'interior', label: 'Interior', appliesTo: ['screen'] },

  // ─── interior-kind ───
  { id: 'enum-010', category: 'interior-kind', value: 'house', label: 'House', appliesTo: ['screen'] },
  { id: 'enum-011', category: 'interior-kind', value: 'cave', label: 'Cave', appliesTo: ['screen'] },
  { id: 'enum-012', category: 'interior-kind', value: 'shop', label: 'Shop', appliesTo: ['screen'] },
  { id: 'enum-013', category: 'interior-kind', value: 'fairy', label: 'Fairy Fountain', appliesTo: ['screen'] },
  { id: 'enum-014', category: 'interior-kind', value: 'well', label: 'Well', appliesTo: ['screen'] },
  { id: 'enum-015', category: 'interior-kind', value: 'passage', label: 'Passage', appliesTo: ['screen'] },
  { id: 'enum-016', category: 'interior-kind', value: 'hint', label: 'Hint', appliesTo: ['screen'] },
  { id: 'enum-017', category: 'interior-kind', value: 'gamble', label: 'Game of Chance', appliesTo: ['screen'] },
  { id: 'enum-018', category: 'interior-kind', value: 'special', label: 'Special', appliesTo: ['screen'] },

  // ─── connection-kind — the six transitions the game itself performs, each
  // taking control away from the player to move them between screens.
  // Everything else the old `transit:*` vocabulary named (walk, swim, ledge,
  // waterfall, grave, bomb, bonk, rock, push, hookshot) is HOW you reach or
  // clear a crossing, not the crossing itself, so those stay tags.
  // edge: scroll across a boundary (overworld border, big-room section boundary).
  // door: room ↔ room doorway — shutter/key/bomb doors are the SAME kind, gated.
  // entrance: overworld ↔ interior threshold (the entranceId / exitId pair).
  // stairs: inter-room / inter-floor staircase (the native stair table).
  // hole: any fall-through — a pit to the room below, an overworld hole into a cave.
  // teleport: warp tiles, whirlpools, cross-world portals. ───
  { id: 'enum-019', category: 'connection-kind', value: 'edge', label: 'Edge', appliesTo: ['connection'] },
  { id: 'enum-020', category: 'connection-kind', value: 'door', label: 'Door', appliesTo: ['connection'] },
  { id: 'enum-021', category: 'connection-kind', value: 'entrance', label: 'Entrance', appliesTo: ['connection'] },
  { id: 'enum-022', category: 'connection-kind', value: 'stairs', label: 'Stairs', appliesTo: ['connection'] },
  { id: 'enum-023', category: 'connection-kind', value: 'hole', label: 'Hole', appliesTo: ['connection'] },
  { id: 'enum-024', category: 'connection-kind', value: 'teleport', label: 'Teleport', appliesTo: ['connection'] },

  // ─── connection-side ───
  { id: 'enum-025', category: 'connection-side', value: 'north', label: 'North', appliesTo: ['connection'] },
  { id: 'enum-026', category: 'connection-side', value: 'south', label: 'South', appliesTo: ['connection'] },
  { id: 'enum-027', category: 'connection-side', value: 'east', label: 'East', appliesTo: ['connection'] },
  { id: 'enum-028', category: 'connection-side', value: 'west', label: 'West', appliesTo: ['connection'] },
  { id: 'enum-029', category: 'connection-side', value: 'up', label: 'Up', appliesTo: ['connection'] },
  { id: 'enum-030', category: 'connection-side', value: 'down', label: 'Down', appliesTo: ['connection'] },

  // ─── actor-kind ───
  { id: 'enum-031', category: 'actor-kind', value: 'enemy', label: 'Enemy', appliesTo: ['actor'] },
  { id: 'enum-032', category: 'actor-kind', value: 'boss', label: 'Boss', appliesTo: ['actor'] },
  { id: 'enum-033', category: 'actor-kind', value: 'npc', label: 'NPC', appliesTo: ['actor'] },
  { id: 'enum-034', category: 'actor-kind', value: 'object', label: 'Object', appliesTo: ['actor'] },
  { id: 'enum-035', category: 'actor-kind', value: 'obstacle', label: 'Obstacle', appliesTo: ['actor'] },
  { id: 'enum-036', category: 'actor-kind', value: 'trigger', label: 'Trigger', appliesTo: ['actor'] },

  // ─── check-kind ───
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

  // ─── item-category — labels reused verbatim from taxonomy/item-categories.ts's ITEM_CATEGORY_LABELS. ───
  { id: 'enum-047', category: 'item-category', value: 'weapon', label: 'Weapon', appliesTo: ['item'] },
  { id: 'enum-048', category: 'item-category', value: 'equipment', label: 'Equipment', appliesTo: ['item'] },
  { id: 'enum-049', category: 'item-category', value: 'medallion', label: 'Medallion', appliesTo: ['item'] },
  { id: 'enum-050', category: 'item-category', value: 'bottle', label: 'Bottle', appliesTo: ['item'] },
  { id: 'enum-051', category: 'item-category', value: 'upgrade', label: 'Upgrade', appliesTo: ['item'] },
  { id: 'enum-052', category: 'item-category', value: 'crystal', label: 'Crystal', appliesTo: ['item'] },
  { id: 'enum-053', category: 'item-category', value: 'event', label: 'Event', appliesTo: ['item'] },
  { id: 'enum-054', category: 'item-category', value: 'junk', label: 'Junk', appliesTo: ['item'] },
  { id: 'enum-055', category: 'item-category', value: 'key', label: 'Key', appliesTo: ['item'] },

  // ─── item-origin ───
  { id: 'enum-056', category: 'item-origin', value: 'vanilla', label: 'Vanilla', appliesTo: ['item'] },
  { id: 'enum-057', category: 'item-origin', value: 'randomizer', label: 'Randomizer', appliesTo: ['item'] },
];

export { ALL_ENUMERATION };
