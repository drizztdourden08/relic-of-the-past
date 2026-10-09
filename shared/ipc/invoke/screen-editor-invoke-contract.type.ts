/* @layer shared-types @kind types */
import type {
  AllocateEnumerationArgs, AllocateEnumerationResult, AllocateGeographyArgs, AllocateGeographyResult,
  AllocateItemGroupArgs, AllocateItemGroupResult, AllocateRecordArgs, AllocateRecordResult, AllocateTagArgs,
  AllocateTagResult, DeleteEnumerationArgs, DeleteItemGroupArgs, DeleteRecordArgs, DeleteTagArgs,
  WriteConnectionPairArgs, WriteConnectionPairResult, WriteConnectionsArgs, WriteEnumerationArgs, WriteItemGroupArgs,
  WriteRecordArgs, WriteRecordResult, WriteScreenArgs, WriteTagArgs,
} from '../screen-editor-contract';
import type { ActorRecord, AreaRecord, CheckRecord, DungeonRecord, ItemRecord, LocationRecord } from '@rotp/game-data';
import type { InvokeResult } from './invoke-result.type';

interface ScreenEditorInvokeContract {
  'screenEditor:writeScreen': (args: WriteScreenArgs) => Promise<WriteRecordResult>;
  'screenEditor:writeConnections': (args: WriteConnectionsArgs) => Promise<WriteRecordResult>;
  'screenEditor:writeConnectionPair': (args: WriteConnectionPairArgs) => Promise<WriteConnectionPairResult>;
  'screenEditor:writeCheck': (args: { filePath: string; code: string; checkId: string | null }) => Promise<InvokeResult>;
  'screenEditor:allocateGeography': (args: AllocateGeographyArgs) => Promise<AllocateGeographyResult>;
  'screenEditor:allocateTag': (args: AllocateTagArgs) => Promise<AllocateTagResult>;
  'screenEditor:writeTag': (args: WriteTagArgs) => Promise<WriteRecordResult>;
  'screenEditor:deleteTag': (args: DeleteTagArgs) => Promise<WriteRecordResult>;
  'screenEditor:allocateItemGroup': (args: AllocateItemGroupArgs) => Promise<AllocateItemGroupResult>;
  'screenEditor:writeItemGroup': (args: WriteItemGroupArgs) => Promise<WriteRecordResult>;
  'screenEditor:deleteItemGroup': (args: DeleteItemGroupArgs) => Promise<WriteRecordResult>;
  'screenEditor:allocateEnumeration': (args: AllocateEnumerationArgs) => Promise<AllocateEnumerationResult>;
  'screenEditor:writeEnumeration': (args: WriteEnumerationArgs) => Promise<WriteRecordResult>;
  'screenEditor:deleteEnumeration': (args: DeleteEnumerationArgs) => Promise<WriteRecordResult>;

  'screenEditor:allocateCheck': (a: AllocateRecordArgs<CheckRecord>) => Promise<AllocateRecordResult<CheckRecord>>;
  'screenEditor:writeCheckRecord': (args: WriteRecordArgs<CheckRecord>) => Promise<WriteRecordResult>;
  'screenEditor:deleteCheck': (args: DeleteRecordArgs) => Promise<WriteRecordResult>;
  'screenEditor:allocateItem': (a: AllocateRecordArgs<ItemRecord>) => Promise<AllocateRecordResult<ItemRecord>>;
  'screenEditor:writeItemRecord': (args: WriteRecordArgs<ItemRecord>) => Promise<WriteRecordResult>;
  'screenEditor:deleteItem': (args: DeleteRecordArgs) => Promise<WriteRecordResult>;
  'screenEditor:allocateDungeon': (a: AllocateRecordArgs<DungeonRecord>) => Promise<AllocateRecordResult<DungeonRecord>>;
  'screenEditor:writeDungeonRecord': (args: WriteRecordArgs<DungeonRecord>) => Promise<WriteRecordResult>;
  'screenEditor:deleteDungeon': (args: DeleteRecordArgs) => Promise<WriteRecordResult>;
  'screenEditor:allocateActor': (a: AllocateRecordArgs<ActorRecord>) => Promise<AllocateRecordResult<ActorRecord>>;
  'screenEditor:writeActorRecord': (args: WriteRecordArgs<ActorRecord>) => Promise<WriteRecordResult>;
  'screenEditor:deleteActor': (args: DeleteRecordArgs) => Promise<WriteRecordResult>;
  'screenEditor:writeAreaRecord': (args: WriteRecordArgs<AreaRecord>) => Promise<WriteRecordResult>;
  'screenEditor:deleteArea': (args: DeleteRecordArgs) => Promise<WriteRecordResult>;
  'screenEditor:writeLocationRecord': (args: WriteRecordArgs<LocationRecord>) => Promise<WriteRecordResult>;
  'screenEditor:deleteLocation': (args: DeleteRecordArgs) => Promise<WriteRecordResult>;
}

export type { ScreenEditorInvokeContract };
