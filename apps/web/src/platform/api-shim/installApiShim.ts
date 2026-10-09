/* @layer renderer-other @kind logic */
import type { IpcApi } from '@shared/ipc';
import { INVOKE_MAP, SEND_MAP, EVENT_MAP } from '@shared/ipc';
import type { AnyFn } from './api-shim.type';
import { EMPTY_ARRAY_METHODS, SCREEN_EDITOR_STUB, STUB_RETURNS } from './api-shim.constants';
import { eventStub } from './eventStub';
import { readNativeAppVersion } from './readNativeAppVersion';

const installApiShim = (): void => {
  if ((window as { api?: unknown }).api) return;

  const api: Record<string, unknown> = {
    isDev: false,
    autoFlood: false,
    os: 'android',
    getSpritesBaseUrl: () => '',
    getFilePath: () => '',
    startup: { fresh: false, widgets: [], automation: false, muted: false, sound: false, autoStart: false },
    instance: { name: null, profile: null },
    updater: {
      capabilities: async () => ({ canCheck: false, canInstall: false }),
      openReleasePage: async () => {},
      check: async () => null,
      getAvailable: async () => null,
      listVersions: async () => [],
      apply: async () => {},
      getPrefs: async () => ({ allowPrerelease: false }),
      setPrefs: async () => {},
      getVersion: readNativeAppVersion,
      onUpdateAvailable: eventStub, onUpToDate: eventStub, onDownloadProgress: eventStub,
      onDownloadComplete: eventStub, onError: eventStub,
    },
    shadowCasting: { load: async () => null, save: async () => {}, getScreen: async () => null },
    screenEditor: SCREEN_EDITOR_STUB,
  };

  for (const method of Object.keys(INVOKE_MAP)) {
    const stub = STUB_RETURNS[method];
    api[method] = (async () => (stub ? stub() : EMPTY_ARRAY_METHODS.has(method) ? [] : null)) as AnyFn;
  }
  for (const method of Object.keys(SEND_MAP)) {
    api[method] = (() => {}) as AnyFn;
  }
  for (const method of Object.keys(EVENT_MAP)) {
    api[method] = eventStub as AnyFn;
  }

  (window as { api?: unknown }).api = api as unknown as IpcApi;
};

export { installApiShim };
