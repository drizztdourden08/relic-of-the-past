/* @layer renderer-other @kind logic */
/**
 * Boot-safe window.api stub for non-Electron hosts (Capacitor / plain browser),
 * where no preload injects window.api. Generated from the IPC channel maps so
 * every method exists: events return a no-op unsubscribe, sends are no-ops, and
 * invokes resolve to a benign empty ([] for known list queries, otherwise null).
 *
 * This lets the renderer mount and land on the ROM picker (useStartup catches the
 * empties) instead of crashing. Real per-capability implementations replace these
 * as ports are ported; the exact empties are refined by booting on a device.
 */
import type { IpcApi } from '@shared/ipc';
import { INVOKE_MAP, SEND_MAP, EVENT_MAP } from '@shared/ipc';

type AnyFn = (...args: unknown[]) => unknown;

const eventStub = (): (() => void) => () => {};

// Invoke methods whose callers expect an array; everything else resolves to null.
const EMPTY_ARRAY_METHODS = new Set<string>([
  'listProfiles', 'listRoms', 'listRomsWithStatus', 'listStates', 'listSessions',
  'listMsuPacks', 'getMsuTrackList', 'listLanguages', 'listNormalSaves',
  'listAutoSaves', 'enumerateHidDevices', 'getOpenHidKeys', 'getSlotInfos',
]);

// Invoke methods whose callers immediately read a property of the result; a bare
// null would throw on access. These return a contract-shaped empty object so the
// renderer boots cleanly (matches the contract in shared/ipc/invoke-contract.ts).
const STUB_RETURNS: Record<string, () => unknown> = {
  getAppState: () => ({ lastProfileId: null }),
  getTestArgs: () => ({ autoState: null, screenshot: null }),
};

const installApiShim = (): void => {
  if ((window as { api?: unknown }).api) return; // real api present → leave it

  const api: Record<string, unknown> = {
    isDev: false,
    autoFlood: false,
    os: 'android',
    getSpritesBaseUrl: () => '',
    getFilePath: () => '',
    startup: { fresh: false, widgets: [], automation: false },
    instance: { name: null, profile: null },
    updater: {
      isPortable: async () => true,
      check: async () => {},
      getAvailable: async () => null,
      download: async () => {},
      install: async () => {},
      getVersion: async () => {
        // Native hosts (Capacitor) report the real app version (Android versionName,
        // itself derived from the repo-root package.json). Plain web has no native
        // App plugin, so getInfo() throws → fall back to a placeholder.
        try {
          const { App } = await import('@capacitor/app');
          return (await App.getInfo()).version || '0.0.0';
        } catch {
          return '0.0.0';
        }
      },
      onUpdateAvailable: eventStub, onUpToDate: eventStub, onDownloadProgress: eventStub,
      onDownloadComplete: eventStub, onError: eventStub,
    },
    shadowCasting: { load: async () => null, save: async () => {}, getScreen: async () => null },
    // Editing the dataset needs a repo on disk, so every channel refuses here
    // rather than silently reporting success.
    screenEditor: {
      writeScreen: async () => ({ success: false, error: 'The dataset editor needs the desktop app.' }),
      writeConnections: async () => ({ success: false, error: 'The dataset editor needs the desktop app.' }),
      writeCheck: async () => ({ success: false, error: 'The dataset editor needs the desktop app.' }),
      allocateGeography: async () => ({ success: false, error: 'The dataset editor needs the desktop app.' }),
    },
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
