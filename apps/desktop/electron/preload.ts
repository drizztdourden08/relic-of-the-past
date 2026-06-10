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

const api: IpcApi = {
  // Non-IPC helpers
  isDev: process.env.NODE_ENV !== 'production',
  autoFlood: process.argv.includes('--auto-flood'),
  getSpritesBaseUrl: (romFile) => `app-sprite://sprites/${romStem(romFile)}/`,
  getFilePath: (file) => webUtils.getPathForFile(file),

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
    isPortable: () => invoke('updater:isPortable'),
    check: () => invoke('updater:check'),
    getAvailable: () => invoke('updater:getAvailable'),
    download: () => invoke('updater:download'),
    install: () => invoke('updater:install'),
    getVersion: () => invoke('updater:getVersion'),
    onUpdateAvailable: (cb) => subscribe('updater:update-available', cb),
    onUpToDate: (cb) => subscribe('updater:up-to-date', cb),
    onDownloadProgress: (cb) => subscribe('updater:download-progress', cb),
    onDownloadComplete: (cb) => subscribe('updater:download-complete', cb),
    onError: (cb) => subscribe('updater:error', cb),
  },
  screenEditor: {
    writeRegion: (args) => invoke('screenEditor:writeScreen', args),
    writeConnections: (args) => invoke('screenEditor:writeConnections', args),
    appendRegistry: (args) => invoke('screenEditor:appendRegistry', args),
  },
};

contextBridge.exposeInMainWorld('api', api);
