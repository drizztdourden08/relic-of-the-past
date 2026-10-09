/* @layer shared-types @kind types */
import type { InvokeContract } from './invoke-contract.type';
import type { EventContract } from './event-contract.type';

type Unsub = () => void;

interface UpdaterApi {
  capabilities: InvokeContract['updater:capabilities'];
  openReleasePage: InvokeContract['updater:openReleasePage'];
  check: InvokeContract['updater:check'];
  getAvailable: InvokeContract['updater:getAvailable'];
  listVersions: InvokeContract['updater:listVersions'];
  apply: InvokeContract['updater:apply'];
  getPrefs: InvokeContract['updater:getPrefs'];
  setPrefs: InvokeContract['updater:setPrefs'];
  getVersion: InvokeContract['updater:getVersion'];
  onUpdateAvailable: (cb: EventContract['updater:update-available']) => Unsub;
  onUpToDate: (cb: EventContract['updater:up-to-date']) => Unsub;
  onDownloadProgress: (cb: EventContract['updater:download-progress']) => Unsub;
  onDownloadComplete: (cb: EventContract['updater:download-complete']) => Unsub;
  onError: (cb: EventContract['updater:error']) => Unsub;
}

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




export type { UpdaterApi, ShadowCastingApi, ScreenEditorApi };
