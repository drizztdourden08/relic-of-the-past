/* @layer renderer-other @kind constants */
import type { ScreenEditorApi } from '@app/ipc';
import { readNativeAppVersion } from './read-native-app-version';
import { refuseEdit } from './refuse-edit';

const EMPTY_ARRAY_METHODS = new Set<string>([
  'listProfiles', 'listRoms', 'listRomsWithStatus', 'listStates', 'listSessions',
  'listMsuPacks', 'getMsuTrackList', 'listMsuAudioFiles', 'listLanguages', 'listNormalSaves',
  'listAutoSaves', 'getSlotInfos',
]);

const STUB_RETURNS: Record<string, () => unknown> = {
  getAppState: () => ({ lastProfileId: null }),
  getTestArgs: () => ({ autoState: null, screenshot: null }),
  getAppVersion: readNativeAppVersion,
};

const SCREEN_EDITOR_STUB: ScreenEditorApi = {
  writeScreen: refuseEdit, writeConnections: refuseEdit, writeConnectionPair: refuseEdit, writeCheck: refuseEdit,
  allocateGeography: refuseEdit, allocateTag: refuseEdit, writeTag: refuseEdit, deleteTag: refuseEdit,
  allocateItemGroup: refuseEdit, writeItemGroup: refuseEdit, deleteItemGroup: refuseEdit,
  allocateEnumeration: refuseEdit, writeEnumeration: refuseEdit, deleteEnumeration: refuseEdit,
  allocateCheck: refuseEdit, writeCheckRecord: refuseEdit, deleteCheck: refuseEdit,
  allocateItem: refuseEdit, writeItemRecord: refuseEdit, deleteItem: refuseEdit,
  allocateDungeon: refuseEdit, writeDungeonRecord: refuseEdit, deleteDungeon: refuseEdit,
  allocateActor: refuseEdit, writeActorRecord: refuseEdit, deleteActor: refuseEdit,
  writeAreaRecord: refuseEdit, deleteArea: refuseEdit,
  writeLocationRecord: refuseEdit, deleteLocation: refuseEdit,
};

export { EMPTY_ARRAY_METHODS, STUB_RETURNS, SCREEN_EDITOR_STUB };
