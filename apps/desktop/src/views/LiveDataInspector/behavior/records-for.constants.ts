/* @layer renderer-widgets @kind constants */
import type { EntityKind } from '@rotp/game-data';
import type { DetectionContext } from '@rotp/navigation';
import type { LiveRecord } from '../LiveDataInspector.type';
import { actorRecords } from './actor-records';
import { checkRecords } from './check-records';
import { dungeonRecords } from './dungeon-records';
import { itemRecords } from './item-records';
import { screenRecords } from './screen-records';

const RECORD_RESOLVERS: Partial<Record<EntityKind, (context: DetectionContext) => readonly LiveRecord[]>> = {
  screen: screenRecords,
  dungeon: dungeonRecords,
  connection: context => context.observations.existingConnections,
  check: checkRecords,
  actor: actorRecords,
  item: itemRecords,
};

export { RECORD_RESOLVERS };
