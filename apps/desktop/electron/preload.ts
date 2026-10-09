/* @layer electron-main @kind logic */
import { contextBridge, webUtils } from 'electron';
import { parse } from 'path';
import type { IpcApi } from '@shared/ipc';
import { INVOKE_MAP, SEND_MAP, EVENT_MAP } from '@shared/ipc';
import { invoke, subscribe, buildInvoke, buildSend, buildEvents } from './lib/ipc/bridge';

const romStem = (romFile: string): string => parse(romFile).name;

const forwardedFlag = (flag: string): string | null =>
  process.argv.find((a) => a.startsWith(`${flag}=`))?.slice(flag.length + 1) || null;

const api: IpcApi = {
  isDev: process.env.NODE_ENV !== 'production',
  autoFlood: process.argv.includes('--auto-flood'),
  os: process.platform,
  getSpritesBaseUrl: (romFile) => `app-sprite://sprites/${romStem(romFile)}/`,
  getFilePath: (file) => webUtils.getPathForFile(file),
  startup: {
    fresh: process.argv.includes('--startup-fresh'),
    widgets: (process.argv.find((a) => a.startsWith('--startup-widgets='))?.slice('--startup-widgets='.length).split(',').filter(Boolean)) ?? [],
    automation: process.argv.includes('--startup-automation'),
    muted: process.argv.includes('--startup-muted'),
    sound: process.argv.includes('--startup-sound'),
    autoStart: process.argv.includes('--startup-auto-start'),
  },
  instance: {
    name: forwardedFlag('--startup-instance'),
    profile: forwardedFlag('--startup-profile'),
  },

  ...buildInvoke(INVOKE_MAP),
  ...buildSend(SEND_MAP),
  ...buildEvents(EVENT_MAP),

  shadowCasting: {
    load: () => invoke('shadow-casting:load'),
    save: (data) => invoke('shadow-casting:save', data),
    getScreen: (screenId) => invoke('shadow-casting:get-screen', screenId),
  },
  updater: {
    capabilities: () => invoke('updater:capabilities'),
    openReleasePage: (version) => invoke('updater:openReleasePage', version),
    check: () => invoke('updater:check'),
    getAvailable: () => invoke('updater:getAvailable'),
    listVersions: () => invoke('updater:listVersions'),
    apply: (version) => invoke('updater:apply', version),
    getPrefs: () => invoke('updater:getPrefs'),
    setPrefs: (prefs) => invoke('updater:setPrefs', prefs),
    getVersion: () => invoke('updater:getVersion'),
    onUpdateAvailable: (cb) => subscribe('updater:update-available', cb),
    onUpToDate: (cb) => subscribe('updater:up-to-date', cb),
    onDownloadProgress: (cb) => subscribe('updater:download-progress', cb),
    onDownloadComplete: (cb) => subscribe('updater:download-complete', cb),
    onError: (cb) => subscribe('updater:error', cb),
  },
  screenEditor: {
    writeScreen: (args) => invoke('screenEditor:writeScreen', args),
    writeConnections: (args) => invoke('screenEditor:writeConnections', args),
    writeConnectionPair: (args) => invoke('screenEditor:writeConnectionPair', args),
    writeCheck: (args) => invoke('screenEditor:writeCheck', args),
    allocateGeography: (args) => invoke('screenEditor:allocateGeography', args),
    allocateTag: (args) => invoke('screenEditor:allocateTag', args),
    writeTag: (args) => invoke('screenEditor:writeTag', args),
    deleteTag: (args) => invoke('screenEditor:deleteTag', args),
    allocateItemGroup: (args) => invoke('screenEditor:allocateItemGroup', args),
    writeItemGroup: (args) => invoke('screenEditor:writeItemGroup', args),
    deleteItemGroup: (args) => invoke('screenEditor:deleteItemGroup', args),
    allocateEnumeration: (args) => invoke('screenEditor:allocateEnumeration', args),
    writeEnumeration: (args) => invoke('screenEditor:writeEnumeration', args),
    deleteEnumeration: (args) => invoke('screenEditor:deleteEnumeration', args),
    allocateCheck: (args) => invoke('screenEditor:allocateCheck', args),
    writeCheckRecord: (args) => invoke('screenEditor:writeCheckRecord', args),
    deleteCheck: (args) => invoke('screenEditor:deleteCheck', args),
    allocateItem: (args) => invoke('screenEditor:allocateItem', args),
    writeItemRecord: (args) => invoke('screenEditor:writeItemRecord', args),
    deleteItem: (args) => invoke('screenEditor:deleteItem', args),
    allocateDungeon: (args) => invoke('screenEditor:allocateDungeon', args),
    writeDungeonRecord: (args) => invoke('screenEditor:writeDungeonRecord', args),
    deleteDungeon: (args) => invoke('screenEditor:deleteDungeon', args),
    allocateActor: (args) => invoke('screenEditor:allocateActor', args),
    writeActorRecord: (args) => invoke('screenEditor:writeActorRecord', args),
    deleteActor: (args) => invoke('screenEditor:deleteActor', args),
    writeAreaRecord: (args) => invoke('screenEditor:writeAreaRecord', args),
    deleteArea: (args) => invoke('screenEditor:deleteArea', args),
    writeLocationRecord: (args) => invoke('screenEditor:writeLocationRecord', args),
    deleteLocation: (args) => invoke('screenEditor:deleteLocation', args),
  },
  uiViews: {
    load: () => invoke('uiViews:load'),
    save: (data) => invoke('uiViews:save', data),
  },
};

contextBridge.exposeInMainWorld('api', api);

contextBridge.exposeInMainWorld('__relicDebug', {
  forceAspect: process.env.RELIC_FORCE_ASPECT || null,
});
