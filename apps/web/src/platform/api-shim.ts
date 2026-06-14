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

const installApiShim = (): void => {
  if ((window as { api?: unknown }).api) return; // real api present → leave it

  const api: Record<string, unknown> = {
    isDev: false,
    autoFlood: false,
    os: 'android',
    getSpritesBaseUrl: () => '',
    getFilePath: () => '',
    updater: {
      isPortable: async () => true,
      check: async () => {},
      getAvailable: async () => null,
      download: async () => {},
      install: async () => {},
      getVersion: async () => '0.0.0',
      onUpdateAvailable: eventStub, onUpToDate: eventStub, onDownloadProgress: eventStub,
      onDownloadComplete: eventStub, onError: eventStub,
    },
    shadowCasting: { load: async () => null, save: async () => {}, getScreen: async () => null },
    screenEditor: { writeRegion: async () => {}, writeConnections: async () => {}, appendRegistry: async () => {} },
  };

  for (const method of Object.keys(INVOKE_MAP)) {
    api[method] = (async () => (EMPTY_ARRAY_METHODS.has(method) ? [] : null)) as AnyFn;
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
