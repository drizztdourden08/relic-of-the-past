/* @layer shared-types @kind logic */
/**
 * `IpcApi` — the renderer-facing `window.api` surface, DERIVED from the channel
 * contracts + join maps. Flat invoke/send/event methods carry exactly their
 * contract signature (no hand-written duplication); nested namespaces and the
 * few non-IPC helpers are spelled out.
 */
import type { InvokeContract } from './invoke-contract';
import type { SendContract } from './send-contract';
import type { EventContract } from './event-contract';
import type { INVOKE_MAP, SEND_MAP, EVENT_MAP } from './maps';

type Unsub = () => void;

type InvokeApi = { [M in keyof typeof INVOKE_MAP]: InvokeContract[(typeof INVOKE_MAP)[M]] };
type SendApi = { [M in keyof typeof SEND_MAP]: SendContract[(typeof SEND_MAP)[M]] };
type EventApi = { [M in keyof typeof EVENT_MAP]: (callback: EventContract[(typeof EVENT_MAP)[M]]) => Unsub };

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

interface UiViewsApi {
  load: InvokeContract['uiViews:load'];
  save: InvokeContract['uiViews:save'];
}

// Non-IPC helpers exposed on window.api (process flags + pure renderer helpers).
interface ExtrasApi {
  isDev: boolean;
  autoFlood: boolean;
  os: string; // process.platform on Electron ('win32' | 'darwin' | 'linux')
  getSpritesBaseUrl: (romFile: string) => string;
  getFilePath: (file: File) => string;
  // Test/automation startup flags (see electron window/startup-config.ts). `automation`
  // is true for ANY automated launch and makes it read-only for shared configuration.
  startup: {
    fresh: boolean; widgets: string[]; automation: boolean;
    // The launch's audio intent, applied through the app's own mute control. Both
    // directions are explicit so neither depends on the profile's stored volume.
    muted: boolean; sound: boolean;
    // Boot the game and stop at its title screen; no save state involved.
    autoStart: boolean;
  };
  // Named-instance identity (see electron instance/instance-config.ts). Both null on
  // a normal launch; `name` marks the window, `profile` is the profile to boot into.
  instance: { name: string | null; profile: string | null };
}

type IpcApi = InvokeApi & SendApi & EventApi & ExtrasApi & {
  updater: UpdaterApi;
  shadowCasting: ShadowCastingApi;
  screenEditor: ScreenEditorApi;
  uiViews: UiViewsApi;
};

export type { IpcApi, UpdaterApi, ShadowCastingApi, ScreenEditorApi, UiViewsApi };
