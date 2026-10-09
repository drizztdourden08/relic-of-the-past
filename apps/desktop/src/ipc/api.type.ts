/* @layer shared-types @kind types */
import type { InvokeContract } from './invoke-contract.type';

interface ShadowCastingApi {
  load: InvokeContract['shadow-casting:load'];
  save: InvokeContract['shadow-casting:save'];
  getScreen: InvokeContract['shadow-casting:get-screen'];
}

interface ScreenEditorApi {
  writeScreen: InvokeContract['screenEditor:writeScreen'];
  writeConnections: InvokeContract['screenEditor:writeConnections'];
  writeConnectionPair: InvokeContract['screenEditor:writeConnectionPair'];
  writeCheck: InvokeContract['screenEditor:writeCheck'];
  allocateGeography: InvokeContract['screenEditor:allocateGeography'];
  allocateTag: InvokeContract['screenEditor:allocateTag'];
  writeTag: InvokeContract['screenEditor:writeTag'];
  deleteTag: InvokeContract['screenEditor:deleteTag'];
  allocateItemGroup: InvokeContract['screenEditor:allocateItemGroup'];
  writeItemGroup: InvokeContract['screenEditor:writeItemGroup'];
  deleteItemGroup: InvokeContract['screenEditor:deleteItemGroup'];
  allocateEnumeration: InvokeContract['screenEditor:allocateEnumeration'];
  writeEnumeration: InvokeContract['screenEditor:writeEnumeration'];
  deleteEnumeration: InvokeContract['screenEditor:deleteEnumeration'];
  allocateCheck: InvokeContract['screenEditor:allocateCheck'];
  writeCheckRecord: InvokeContract['screenEditor:writeCheckRecord'];
  deleteCheck: InvokeContract['screenEditor:deleteCheck'];
  allocateItem: InvokeContract['screenEditor:allocateItem'];
  writeItemRecord: InvokeContract['screenEditor:writeItemRecord'];
  deleteItem: InvokeContract['screenEditor:deleteItem'];
  allocateDungeon: InvokeContract['screenEditor:allocateDungeon'];
  writeDungeonRecord: InvokeContract['screenEditor:writeDungeonRecord'];
  deleteDungeon: InvokeContract['screenEditor:deleteDungeon'];
  allocateActor: InvokeContract['screenEditor:allocateActor'];
  writeActorRecord: InvokeContract['screenEditor:writeActorRecord'];
  deleteActor: InvokeContract['screenEditor:deleteActor'];
  writeAreaRecord: InvokeContract['screenEditor:writeAreaRecord'];
  deleteArea: InvokeContract['screenEditor:deleteArea'];
  writeLocationRecord: InvokeContract['screenEditor:writeLocationRecord'];
  deleteLocation: InvokeContract['screenEditor:deleteLocation'];
}




export type { ShadowCastingApi, ScreenEditorApi };
