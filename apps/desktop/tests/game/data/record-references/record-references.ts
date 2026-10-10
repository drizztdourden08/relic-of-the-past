/* @layer tests @kind helper */
import { all } from '@rotp/game-data';
import type { RecordReference, Sink } from './record-references.type';
import { checkReferences } from './check-references';
import { connectionReferences } from './connection-references';
import { dungeonReferences } from './dungeon-references';
import { itemReferences } from './item-references';
import { regionReferences } from './region-references';
import { screenReferences } from './screen-references';
import { sinkFor } from './sink-for';
import { walkRequirement } from './walk-requirement';

const collect = <T extends { id: string }>(
  records: readonly T[],
  refs: RecordReference[],
  read: (record: T, take: Sink) => void,
): void => {
  for (const record of records) read(record, sinkFor(record.id, refs));
};

const recordReferences = (): RecordReference[] => {
  const refs: RecordReference[] = [];

  collect(all('screen'), refs, screenReferences);
  collect(all('check'), refs, checkReferences);
  collect(all('connection'), refs, connectionReferences);
  collect(all('item'), refs, itemReferences);
  collect(all('dungeon'), refs, dungeonReferences);
  collect(all('region'), refs, regionReferences);
  collect(all('location'), refs, (location, take) => take('area', 'areaId', location.areaId));
  collect(all('item-group'), refs, (group, take) => {
    for (const id of group.memberIds) take('item', 'memberIds', id);
  });
  collect(all('actor'), refs, (actor, take) => {
    if (actor.clearedBy) walkRequirement(actor.clearedBy, 'clearedBy', take);
  });

  return refs;
};

export { recordReferences };
