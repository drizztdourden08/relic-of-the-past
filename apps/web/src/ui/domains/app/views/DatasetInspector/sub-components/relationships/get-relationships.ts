/* @layer renderer-app @kind logic */
import type {
  ActorRecord, CheckRecord, ConnectionRecord, DungeonRecord, EntityKind, ItemRecord,
  LocationRecord, Requirement, ScreenRecord,
} from '@shared/game/data';
import type { RelationshipGroup } from './relationships.type';

/** Walks a requirement tree down to its id leaves — group-count leaves aren't a single navigable id, so they're skipped. */
const flattenRequirementIds = (requirement?: Requirement): string[] => {
  if (!requirement) return [];
  if ('itemId' in requirement) return [requirement.itemId];
  if ('checkId' in requirement) return [requirement.checkId];
  if ('anyOf' in requirement) return requirement.anyOf.flatMap(flattenRequirementIds);
  if ('allOf' in requirement) return requirement.allOf.flatMap(flattenRequirementIds);
  return [];
};

const single = (label: string, id?: string): RelationshipGroup | undefined => (id ? { label, ids: [id] } : undefined);

const many = (label: string, ids?: readonly string[]): RelationshipGroup | undefined =>
  ids && ids.length > 0 ? { label, ids: Array.from(new Set(ids)) } : undefined;

const compact = (groups: (RelationshipGroup | undefined)[]): RelationshipGroup[] =>
  groups.filter((group): group is RelationshipGroup => group !== undefined);

const screenRelationships = (r: ScreenRecord): RelationshipGroup[] => compact([
  single('Area', r.areaId),
  single('Location', r.locationId),
  many('Triggers', r.triggerIds),
  many('Spawns', r.spawns?.map(spawn => spawn.actorId)),
]);

const connectionRelationships = (r: ConnectionRecord): RelationshipGroup[] => compact([
  single('From', r.fromScreenId),
  single('To', r.toScreenId),
  single('Counterpart', r.counterpartId),
  single('Gated by', r.gatedBy),
  single('Dungeon', r.dungeonId),
  many('Requires', flattenRequirementIds(r.requirements)),
]);

const checkRelationships = (r: CheckRecord): RelationshipGroup[] => compact([
  single('Screen', r.screenId),
  single('Dungeon', r.dungeonId),
  single('Granted by', r.actorId),
  many('Vanilla items', r.vanillaItemIds),
  many('Requires', flattenRequirementIds(r.requirements)),
]);

const itemRelationships = (r: ItemRecord): RelationshipGroup[] => compact([
  single('Dungeon', r.dungeonId),
  single('Alias of', r.aliasOf),
]);

const dungeonRelationships = (r: DungeonRecord): RelationshipGroup[] => compact([
  single('Boss check', r.bossCheckId),
  single('Prize check', r.prizeCheckId),
  single('Medallion', r.medallionGate),
  many('Rooms', r.roomScreenIds),
]);

const locationRelationships = (r: LocationRecord): RelationshipGroup[] => compact([single('Area', r.areaId)]);

const actorRelationships = (r: ActorRecord): RelationshipGroup[] => compact([
  many('Cleared by', flattenRequirementIds(r.clearedBy)),
]);

/** The navigable edges out of one record, per kind — empty groups are already dropped. */
const getRelationships = (kind: EntityKind, raw: Record<string, unknown>): RelationshipGroup[] => {
  switch (kind) {
    case 'screen': return screenRelationships(raw as unknown as ScreenRecord);
    case 'connection': return connectionRelationships(raw as unknown as ConnectionRecord);
    case 'check': return checkRelationships(raw as unknown as CheckRecord);
    case 'item': return itemRelationships(raw as unknown as ItemRecord);
    case 'dungeon': return dungeonRelationships(raw as unknown as DungeonRecord);
    case 'location': return locationRelationships(raw as unknown as LocationRecord);
    case 'actor': return actorRelationships(raw as unknown as ActorRecord);
    case 'area': return [];
    default: return [];
  }
};

export { getRelationships };
