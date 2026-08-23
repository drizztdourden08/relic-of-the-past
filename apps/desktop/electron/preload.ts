/* @layer electron-main @kind logic */
/**
 * Preload bridge. The flat `window.api` methods are GENERATED from the join maps
 * (buildInvoke/buildSend/buildEvents); only the non-IPC helpers and the nested
 * namespaces are spelled out. `const api: IpcApi` ties the whole surface to the
 * shared contract.
 */
import { contextBridge, webUtils } from 'electron';
import { parse } from 'path';
import type { IpcApi } from '@shared/ipc';
import { INVOKE_MAP, SEND_MAP, EVENT_MAP } from '@shared/ipc';
import { invoke, subscribe, buildInvoke, buildSend, buildEvents } from './lib/ipc/bridge';

const romStem = (romFile: string): string => parse(romFile).name;

/** Read a `--flag=value` argument forwarded from main via additionalArguments. */
const forwardedFlag = (flag: string): string | null =>
  process.argv.find((a) => a.startsWith(`${flag}=`))?.slice(flag.length + 1) || null;

const api: IpcApi = {
  // Non-IPC helpers
  isDev: process.env.NODE_ENV !== 'production',
  autoFlood: process.argv.includes('--auto-flood'),
  os: process.platform,
  getSpritesBaseUrl: (romFile) => `app-sprite://sprites/${romStem(romFile)}/`,
  getFilePath: (file) => webUtils.getPathForFile(file),
  // Test/automation layout flags, forwarded from main via additionalArguments.
  startup: {
    fresh: process.argv.includes('--startup-fresh'),
    widgets: (process.argv.find((a) => a.startsWith('--startup-widgets='))?.slice('--startup-widgets='.length).split(',').filter(Boolean)) ?? [],
    // True for any test/automation launch. Such a run must not write the configuration
    // every launch shares — see lib/instance.ts.
    automation: process.argv.includes('--startup-automation'),
    // Start with the app's master volume at zero. A launch flag, never a window-level
    // audio override, so the in-app control still reflects and owns the state.
    muted: process.argv.includes('--startup-muted'),
    sound: process.argv.includes('--startup-sound'),
    autoStart: process.argv.includes('--startup-auto-start'),
  },
  // Named-instance identity (--instance / --profile), null on a normal launch. The
  // renderer marks the window with the name and boots straight into `profile`.
  instance: {
    name: forwardedFlag('--startup-instance'),
    profile: forwardedFlag('--startup-profile'),
  },

  // Flat methods generated from the channel maps
  ...buildInvoke(INVOKE_MAP),
  ...buildSend(SEND_MAP),
  ...buildEvents(EVENT_MAP),

  // Nested namespaces (still typed via invoke/subscribe)
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

// Dev/test aid (not part of the IpcApi contract): when RELIC_FORCE_ASPECT is set in the environment
// (e.g. a Playwright launch passing env: { RELIC_FORCE_ASPECT: '16:9' }), the renderer overrides the
// profile's aspect ratio at boot so the wide/tall camera paths can be exercised without changing it
// in-app. Null in normal runs — has no effect.
contextBridge.exposeInMainWorld('__relicDebug', {
  forceAspect: process.env.RELIC_FORCE_ASPECT || null,
});
