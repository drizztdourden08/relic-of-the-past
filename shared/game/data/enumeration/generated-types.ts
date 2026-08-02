/* @layer shared-game @kind generated */
/**
 * GENERATED — do not hand-edit. Regenerate with `npm run generate:enum-types`
 * (scripts/generate-enum-types.mjs), which reads `ALL_ENUMERATION`
 * (../enumeration.ts) and emits one union type per category.
 */

type World = 'light' | 'dark' | 'both';
type ScreenStatus = 'draft' | 'mapped' | 'verified';
type ScreenKind = 'overworld' | 'dungeon' | 'interior';
type InteriorKind = 'house' | 'cave' | 'shop' | 'fairy' | 'well' | 'passage' | 'hint' | 'gamble' | 'special';
type ConnectionKind = 'edge' | 'door' | 'entrance' | 'stairs' | 'hole' | 'teleport';
type ConnectionSide = 'north' | 'south' | 'east' | 'west' | 'up' | 'down';
type ActorKind = 'enemy' | 'boss' | 'npc' | 'object' | 'obstacle' | 'trigger';
type CheckKind = 'chest' | 'npc' | 'standing' | 'boss' | 'prize' | 'keyDrop' | 'potItem' | 'dig' | 'bonk' | 'event';
type ItemCategory = 'weapon' | 'equipment' | 'medallion' | 'bottle' | 'upgrade' | 'crystal' | 'event' | 'junk' | 'key';
type ItemOrigin = 'vanilla' | 'randomizer';

export type {
  ActorKind, CheckKind, ConnectionKind, ConnectionSide,
  InteriorKind, ItemCategory, ItemOrigin, ScreenKind,
  ScreenStatus, World,
};
