/* @layer electron-preload @kind logic */
import type { PreloadNamespace } from '@drizztdourden08/brock-electron/preload';
import type { EventCallback, InvokeArg } from './namespace-args.type';

const updaterNamespace: PreloadNamespace = {
  id: 'updater',
  build: ({ invoke, subscribe }) => ({
    capabilities: () => invoke('updater:capabilities'),
    openReleasePage: (version: InvokeArg<'updater:openReleasePage'>) => invoke('updater:openReleasePage', version),
    check: () => invoke('updater:check'),
    getAvailable: () => invoke('updater:getAvailable'),
    listVersions: () => invoke('updater:listVersions'),
    apply: (version: InvokeArg<'updater:apply'>) => invoke('updater:apply', version),
    getPrefs: () => invoke('updater:getPrefs'),
    setPrefs: (prefs: InvokeArg<'updater:setPrefs'>) => invoke('updater:setPrefs', prefs),
    getVersion: () => invoke('updater:getVersion'),
    onUpdateAvailable: (cb: EventCallback<'updater:update-available'>) => subscribe('updater:update-available', cb),
    onUpToDate: (cb: EventCallback<'updater:up-to-date'>) => subscribe('updater:up-to-date', cb),
    onDownloadProgress: (cb: EventCallback<'updater:download-progress'>) => subscribe('updater:download-progress', cb),
    onDownloadComplete: (cb: EventCallback<'updater:download-complete'>) => subscribe('updater:download-complete', cb),
    onError: (cb: EventCallback<'updater:error'>) => subscribe('updater:error', cb),
  }),
};

export { updaterNamespace };
