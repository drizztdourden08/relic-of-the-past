/* @layer shared-game @kind logic */
/**
 * Reverse references for the six collections that gained a delete path.
 *
 * Same bargain as reference-index.ts's two originals: read off the registry
 * rather than off a second hand-maintained list, so this stays correct as the
 * data changes. Every field a real record carries TODAY is walked — including
 * the ones buried in a Requirement or a presence condition, which is exactly
 * where a dangling reference would otherwise hide from a delete-guard.
 *
 * These six are guarded because every one of them is pointed AT: a dungeon by
 * its checks, items and crossings; an area by its screens and locations; a
 * location by its screens; an actor by the checks it grants, the crossings it
 * gates and the screens it spawns on; an item by half the dataset; a check by
 * its dungeon's boss/prize fields and by other records' requirements. Removing
 * any of them without showing that first would leave ids pointing at nothing.
 */
import { all } from '../registry';
import { presenceNamesItem, requirementNames } from './requirement-leaves';
import type { EntityKind, EntityOf } from '../types';
import type { ReferenceHit } from './reference-index.type';

/** Every record of one kind whose named field points at the id being asked about. */
const scan = <K extends EntityKind>(
  kind: K,
  field: string,
  matches: (record: EntityOf<K>) => boolean,
): ReferenceHit[] =>
  all(kind).filter(matches).map(record => ({ kind, id: (record as { id: string }).id, field }));

const referencesToDungeon = (id: string): ReferenceHit[] => [
  ...scan('check', 'dungeonId', check => check.dungeonId === id),
  ...scan('item', 'dungeonId', item => item.dungeonId === id),
  ...scan('connection', 'dungeonId', connection => connection.dungeonId === id),
];

const referencesToArea = (id: string): ReferenceHit[] => [
  ...scan('screen', 'areaId', screen => screen.areaId === id),
  ...scan('location', 'areaId', location => location.areaId === id),
];

const referencesToLocation = (id: string): ReferenceHit[] =>
  scan('screen', 'locationId', screen => screen.locationId === id);

const referencesToActor = (id: string): ReferenceHit[] => [
  ...scan('check', 'actorId', check => check.actorId === id),
  ...scan('connection', 'gatedBy', connection => connection.gatedBy === id),
  ...scan('screen', 'triggerIds', screen => screen.triggerIds?.includes(id as never) ?? false),
  ...scan('screen', 'spawns', screen => screen.spawns?.some(spawn => spawn.actorId === id) ?? false),
];

const referencesToItem = (id: string): ReferenceHit[] => [
  ...scan('check', 'vanillaItemIds', check => check.vanillaItemIds.includes(id as never)),
  ...scan('check', 'requirements', check => !!check.requirements && requirementNames(check.requirements, 'itemId', id)),
  ...scan('check', 'presence', check => !!check.presence && presenceNamesItem(check.presence, id)),
  ...scan('connection', 'requirements', c => !!c.requirements && requirementNames(c.requirements, 'itemId', id)),
  ...scan('actor', 'clearedBy', actor => !!actor.clearedBy && requirementNames(actor.clearedBy, 'itemId', id)),
  ...scan('dungeon', 'medallionGate', dungeon => dungeon.medallionGate === id),
  ...scan('item', 'aliasOf', item => item.aliasOf === id),
  ...scan('item-group', 'memberIds', group => group.memberIds.includes(id as never)),
];

/** A screen variant may be conditioned on a check, which is a reference like any other. */
const variantNamesCheck = (variant: EntityOf<'screen'>['variant'], id: string): boolean =>
  variant?.condition.type === 'check' && variant.condition.id === id;

const referencesToCheck = (id: string): ReferenceHit[] => [
  ...scan('dungeon', 'bossCheckId', dungeon => dungeon.bossCheckId === id),
  ...scan('dungeon', 'prizeCheckId', dungeon => dungeon.prizeCheckId === id),
  ...scan('check', 'requirements', check => !!check.requirements && requirementNames(check.requirements, 'checkId', id)),
  ...scan('connection', 'requirements', c => !!c.requirements && requirementNames(c.requirements, 'checkId', id)),
  ...scan('actor', 'clearedBy', actor => !!actor.clearedBy && requirementNames(actor.clearedBy, 'checkId', id)),
  ...scan('screen', 'variant', screen => variantNamesCheck(screen.variant, id)),
];

export {
  referencesToActor, referencesToArea, referencesToCheck, referencesToDungeon,
  referencesToItem, referencesToLocation,
};
