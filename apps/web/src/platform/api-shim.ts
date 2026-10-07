/* @layer renderer-other @kind logic */
/**
 * Boot-safe window.api stub for non-Electron hosts (Capacitor / plain browser),
 * where no preload injects window.api. Generated from the IPC channel maps so
 * every method exists: events return a no-op unsubscribe, sends are no-ops, and
 * invokes resolve to a benign empty ([] for known list queries, otherwise null).
 * Real per-capability implementations replace these as ports are ported.
 */
import type { IpcApi, ScreenEditorApi } from '@shared/ipc';
import { INVOKE_MAP, SEND_MAP, EVENT_MAP } from '@shared/ipc';

type AnyFn = (...args: unknown[]) => unknown;

const eventStub = (): (() => void) => () => {};

// Invoke methods whose callers expect an array; everything else resolves to null.
const EMPTY_ARRAY_METHODS = new Set<string>([
  'listProfiles', 'listRoms', 'listRomsWithStatus', 'listStates', 'listSessions',
  'listMsuPacks', 'getMsuTrackList', 'listMsuAudioFiles', 'listLanguages', 'listNormalSaves',
  'listAutoSaves', 'getSlotInfos', 'listControllers', 'listHidDevices',
]);

// Invoke methods whose callers immediately read a property of the result; a bare
// null would throw on access. These return a contract-shaped empty object so the
// renderer boots (matches the contract in shared/ipc/invoke-contract.ts).
const STUB_RETURNS: Record<string, () => unknown> = {
  getAppState: () => ({ lastProfileId: null }),
  getTestArgs: () => ({ autoState: null, screenshot: null }),
};

/**
 * Editing the dataset needs a repo on disk, so every editor channel refuses here
 * instead of silently reporting success. Spelled out one name per entry, and
 * typed against `ScreenEditorApi`, so a channel added to the contract fails to
 * compile until it refuses here too.
 */
const refuseEdit = async (): Promise<{ success: false; error: string }> =>
  ({ success: false, error: 'The dataset editor needs the desktop app.' });

const SCREEN_EDITOR_STUB = {
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
} satisfies Record<keyof ScreenEditorApi, unknown> as unknown as ScreenEditorApi;

const installApiShim = (): void => {
  if ((window as { api?: unknown }).api) return; // real api present → leave it

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
