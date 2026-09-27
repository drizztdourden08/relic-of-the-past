/* @layer tests @kind helper */
/**
 * Every id one record points at another record with, collected off the live registry.
 *
 * One list, so a single pass can hold the whole dataset against itself. A reference carries
 * where it came FROM (the record and the field) so a failure names the row to open, never
 * just the id that did not resolve. The walk reads the records themselves, so a field added
 * to a type and populated on a record is covered the moment it is walked here, and a field
 * nothing carries yet contributes nothing instead of a false pass.
 *
 * Requirement and presence trees are walked to their leaves, because a dangling id inside
 * `allOf: [{ anyOf: [...] }]` is the one that hides from reading a record by eye.
 */
import { all } from '@shared/game/data';
import type {
  CheckRecord, EntityKind, PresenceCondition, Requirement, ScreenRecord,
} from '@shared/game/data/types';

/** One id a record holds, and the collection it has to resolve in. */
interface RecordReference {
  /** The record that carries it. */
  from: string;
  /** The field it sits in, as a reader would name it. */
  field: string;
  kind: EntityKind;
  id: string;
}

type Sink = (kind: EntityKind, field: string, id: string | undefined | null) => void;

/** A reference collector bound to one record, so every row it takes carries that record's id. */
const sinkFor = (from: string, into: RecordReference[]): Sink =>
  (kind, field, id) => { if (id) into.push({ from, field, kind, id }); };

const walkRequirement = (requirement: Requirement, field: string, take: Sink): void => {
  if ('allOf' in requirement) { for (const sub of requirement.allOf) walkRequirement(sub, field, take); return; }
  if ('anyOf' in requirement) { for (const sub of requirement.anyOf) walkRequirement(sub, field, take); return; }
  if ('itemId' in requirement) take('item', field, requirement.itemId);
  if ('checkId' in requirement) take('check', field, requirement.checkId);
  if ('count' in requirement) take('item-group', field, requirement.count.groupId);
};

const walkPresence = (condition: PresenceCondition, field: string, take: Sink): void => {
  if ('and' in condition) { for (const sub of condition.and) walkPresence(sub, field, take); return; }
  if ('or' in condition) { for (const sub of condition.or) walkPresence(sub, field, take); return; }
  if ('not' in condition) { walkPresence(condition.not, field, take); return; }
  if ('itemId' in condition) take('item', field, condition.itemId);
};

const screenReferences = (screen: ScreenRecord, take: Sink): void => {
  take('area', 'areaId', screen.areaId);
  take('location', 'locationId', screen.locationId);
  take('region', 'regionId', screen.regionId);
  take('screen', 'bounds.screenId', screen.bounds?.screenId);
  for (const id of screen.triggerIds ?? []) take('actor', 'triggerIds', id);
  for (const spawn of screen.spawns ?? []) take('actor', 'spawns[].actorId', spawn.actorId);
  for (const id of screen.tags) take('tag', 'tags', id);
  if (screen.variant?.condition.type === 'check') take('check', 'variant.condition.id', screen.variant.condition.id);
};

const checkReferences = (check: CheckRecord, take: Sink): void => {
  take('screen', 'screenId', check.screenId);
  take('region', 'regionId', check.regionId);
  take('dungeon', 'dungeonId', check.dungeonId);
  take('actor', 'actorId', check.actorId);
  for (const id of check.vanillaItemIds) take('item', 'vanillaItemIds', id);
  for (const id of check.tags ?? []) take('tag', 'tags', id);
  for (const id of check.reachAny ?? []) take('screen', 'reachAny', id);
  take('dungeon', 'derivedDungeon.dungeonId', check.derivedDungeon?.dungeonId);
  if (check.requirements) walkRequirement(check.requirements, 'requirements', take);
  if (check.derived) walkRequirement(check.derived, 'derived', take);
  if (check.fallback) walkRequirement(check.fallback, 'fallback', take);
  if (check.presence) walkPresence(check.presence, 'presence', take);
  if (check.now) walkPresence(check.now, 'now', take);
};

const recordReferences = (): RecordReference[] => {
  const refs: RecordReference[] = [];

  for (const screen of all('screen')) screenReferences(screen, sinkFor(screen.id, refs));
  for (const check of all('check')) checkReferences(check, sinkFor(check.id, refs));

  for (const connection of all('connection')) {
    const take = sinkFor(connection.id, refs);
    take('screen', 'screenId', connection.screenId);
    take('connection', 'toConnectionId', connection.toConnectionId);
    take('dungeon', 'dungeonId', connection.dungeonId);
    take('actor', 'gatedBy', connection.gatedBy);
    for (const id of connection.tags) take('tag', 'tags', id);
    if (connection.requirements) walkRequirement(connection.requirements, 'requirements', take);
  }

  for (const item of all('item')) {
    const take = sinkFor(item.id, refs);
    take('dungeon', 'dungeonId', item.dungeonId);
    take('item', 'aliasOf', item.aliasOf);
    take('check', 'usualChestId', item.usualChestId);
    for (const id of item.sharesSlotWith ?? []) take('item', 'sharesSlotWith', id);
  }

  for (const dungeon of all('dungeon')) {
    const take = sinkFor(dungeon.id, refs);
    take('check', 'bossCheckId', dungeon.bossCheckId);
    take('check', 'prizeCheckId', dungeon.prizeCheckId);
    take('actor', 'bossActorId', dungeon.bossActorId);
    take('item', 'medallionGate', dungeon.medallionGate);
    take('item', 'items.bigKey', dungeon.items.bigKey);
    take('item', 'items.smallKey', dungeon.items.smallKey);
    take('item', 'items.map', dungeon.items.map);
    take('item', 'items.compass', dungeon.items.compass);
    for (const id of dungeon.roomScreenIds) take('screen', 'roomScreenIds', id);
    for (const id of dungeon.regionIds) take('region', 'regionIds', id);
  }

  for (const region of all('region')) {
    const take = sinkFor(region.id, refs);
    take('screen', 'headScreenId', region.headScreenId);
    take('dungeon', 'dungeonId', region.dungeonId);
    take('screen', 'bounds.screenId', region.bounds?.screenId);
  }

  for (const location of all('location')) sinkFor(location.id, refs)('area', 'areaId', location.areaId);

  for (const group of all('item-group')) {
    const take = sinkFor(group.id, refs);
    for (const id of group.memberIds) take('item', 'memberIds', id);
  }

  for (const actor of all('actor')) {
    if (actor.clearedBy) walkRequirement(actor.clearedBy, 'clearedBy', sinkFor(actor.id, refs));
  }

  return refs;
};

export { recordReferences };
export type { RecordReference };
