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
  isPortable: InvokeContract['updater:isPortable'];
  check: InvokeContract['updater:check'];
  getAvailable: InvokeContract['updater:getAvailable'];
  download: InvokeContract['updater:download'];
  install: InvokeContract['updater:install'];
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
  writeRegion: InvokeContract['screenEditor:writeScreen'];
  writeConnections: InvokeContract['screenEditor:writeConnections'];
  appendRegistry: InvokeContract['screenEditor:appendRegistry'];
}

// Non-IPC helpers exposed on window.api (process flags + pure renderer helpers).
interface ExtrasApi {
  isDev: boolean;
  autoFlood: boolean;
  getSpritesBaseUrl: (romFile: string) => string;
  getFilePath: (file: File) => string;
}

type IpcApi = InvokeApi & SendApi & EventApi & ExtrasApi & {
  updater: UpdaterApi;
  shadowCasting: ShadowCastingApi;
  screenEditor: ScreenEditorApi;
};

export type { IpcApi, UpdaterApi, ShadowCastingApi, ScreenEditorApi };
