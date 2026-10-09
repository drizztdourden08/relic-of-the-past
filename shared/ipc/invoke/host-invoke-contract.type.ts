/* @layer shared-types @kind types */
import type { RefreshRateInfo, SyncedRateStatus } from '@shared/types/display';
import type { DataLocation, StorageSummary, FileStat } from '@shared/platform';
import type { SystemDiagnostics } from '@shared/types/diagnostics';
import type { InvokeResult } from './invoke-result.type';

interface HostInvokeContract {
  'app:getUserDataPath': () => Promise<string>;

  'diagnostics:getSystem': () => Promise<SystemDiagnostics>;

  'storage:getLocation': () => Promise<DataLocation>;
  'storage:reveal': () => Promise<void>;
  'storage:revealProfile': (profileId: string) => Promise<InvokeResult>;
  'storage:getSummary': () => Promise<StorageSummary>;

  'file:readBytes': (path: string) => Promise<ArrayBuffer | null>;
  'file:readText': (path: string) => Promise<string | null>;
  'file:writeBytes': (path: string, data: ArrayBuffer) => Promise<void>;
  'file:writeText': (path: string, data: string) => Promise<void>;
  'file:list': (dir: string) => Promise<string[]>;
  'file:remove': (path: string) => Promise<void>;
  'file:trash': (path: string) => Promise<void>;
  'file:exists': (path: string) => Promise<boolean>;
  'file:mkdir': (dir: string) => Promise<void>;
  'file:stat': (path: string) => Promise<FileStat | null>;

  'wasm:readBytes': () => Promise<ArrayBuffer>;

  'window:isMaximized': () => Promise<boolean>;
  'window:setAlwaysOnTop': (value: boolean) => Promise<boolean>;
  'window:setAudioMuted': (value: boolean) => Promise<boolean>;
  'window:isAudioMuted': () => Promise<boolean>;
  'window:isFullscreen': () => Promise<boolean>;

  'display:getRefreshRate': () => Promise<RefreshRateInfo>;
  'display:getSyncedRateStatus': () => Promise<SyncedRateStatus>;
  'display:setSyncedRatePreference': (enabled: boolean, targetHz: number) => Promise<SyncedRateStatus>;
  'display:applyRefreshRate': (hz: number) => Promise<SyncedRateStatus>;

  'dialog:openRom': () => Promise<string | null>;
  'dialog:pickFile': (extensions: string[]) => Promise<{ name: string; data: ArrayBuffer } | null>;
  'dialog:saveFile': (name: string, data: ArrayBuffer, extensions: string[]) => Promise<{ saved: boolean; name?: string; error?: string }>;
}

export type { HostInvokeContract };
