/* @layer tests @kind helper */
import { all } from '@rotp/game-data';
import type { RecordReference } from './record-references.type';
import { checkReferences } from './check-references';
import { screenReferences } from './screen-references';
import { sinkFor } from './sink-for';
import { walkRequirement } from './walk-requirement';

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
