/* @layer renderer-app @kind constants */
import type { ActorRecord, CheckRecord, DungeonRecord, EntityKind, ItemRecord } from '@rotp/game-data';
import { createConnection } from '@app/views/DataInspector/behavior/create-connection';
import type { RecordCreator } from '@app/views/DataInspector/behavior/record-creators.type';
import { screenEditor } from '@app/views/DataInspector/behavior/screen-editor';
import { createArea } from './create-area';
import { createEnumerationRecord } from './create-enumeration-record';
import { createItemGroupRecord } from './create-item-group-record';
import { createLocation } from './create-location';
import { createScreen } from './create-screen';
import { createTagRecord } from './create-tag-record';
import { facadeCreator } from './facade-creator';

const RECORD_CREATORS: Partial<Record<EntityKind, RecordCreator>> = {
  screen: createScreen,
  connection: createConnection,
  tag: createTagRecord,
  'item-group': createItemGroupRecord,
  enumeration: createEnumerationRecord,
  area: createArea,
  location: createLocation,
  check: facadeCreator<CheckRecord>('check', args => screenEditor().allocateCheck(args)),
  item: facadeCreator<ItemRecord>('item', args => screenEditor().allocateItem(args)),
  dungeon: facadeCreator<DungeonRecord>('dungeon', args => screenEditor().allocateDungeon(args)),
  actor: facadeCreator<ActorRecord>('actor', args => screenEditor().allocateActor(args)),
};

export { RECORD_CREATORS };
