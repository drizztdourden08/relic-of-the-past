/* @layer renderer-app @kind constants */
import type {
  ActorRecord, AreaRecord, CheckRecord, DungeonRecord, EntityKind, ItemRecord, LocationRecord,
} from '@shared/game/data';
import type { RecordWriter } from '../../DataInspector.type';
import { screenEditor } from '../screen-editor';
import { facadeWriter } from './facade-writer';
import { writeConnection } from './write-connection';
import { writeEnumerationRecord } from './write-enumeration-record';
import { writeItemGroupRecord } from './write-item-group-record';
import { writeScreen } from './write-screen';
import { writeTag } from './write-tag';

const RECORD_WRITERS: Partial<Record<EntityKind, RecordWriter>> = {
  screen: writeScreen,
  connection: writeConnection,
  tag: writeTag,
  'item-group': writeItemGroupRecord,
  enumeration: writeEnumerationRecord,
  check: facadeWriter<CheckRecord>('check', args => screenEditor().writeCheckRecord(args)),
  item: facadeWriter<ItemRecord>('item', args => screenEditor().writeItemRecord(args)),
  dungeon: facadeWriter<DungeonRecord>('dungeon', args => screenEditor().writeDungeonRecord(args)),
  area: facadeWriter<AreaRecord>('area', args => screenEditor().writeAreaRecord(args)),
  location: facadeWriter<LocationRecord>('location', args => screenEditor().writeLocationRecord(args)),
  actor: facadeWriter<ActorRecord>('actor', args => screenEditor().writeActorRecord(args)),
};

export { RECORD_WRITERS };
