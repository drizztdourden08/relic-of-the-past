/* @layer shared-types @kind types */
import type { Profile, AppState, CreateProfileOptions } from '@shared/types/profile';
import type { NormalSaveInfo, AutoSaveInfo, QuickSaveSlotInfo } from '@shared/types/saves';
import type { PlaySession } from '@shared/types/session';
import type { InvokeResult, TriggerCal } from './invoke-result.type';

interface ProfileDataInvokeContract {
  'profiles:list': () => Promise<Profile[]>;
  'profiles:create': (opts: CreateProfileOptions) => Promise<Profile>;
  'profiles:delete': (id: string) => Promise<void>;
  'profiles:setLast': (id: string) => Promise<void>;
  'profiles:getAppState': () => Promise<AppState>;
  'profiles:updateLastPlayed': (id: string) => Promise<void>;
  'profiles:update': (id: string, patch: Partial<Profile>) => Promise<Profile | null>;

  'roms:list': () => Promise<string[]>;
  'roms:listWithStatus': () => Promise<RomInfo[]>;
  'roms:import': (romPath: string) => Promise<ImportResult>;
  'roms:importUrl': (url: string) => Promise<ImportResult>;
  'roms:delete': (romFile: string) => Promise<void>;
  'roms:getInfo': (romFile: string) => Promise<{ name: string; size: number; hash: string; created: string; modified: string } | null>;

  'assets:check': (romFile: string) => Promise<boolean>;
  'assets:load': (romFile: string) => Promise<ArrayBuffer | null>;
  'assets:extract': (romFile: string) => Promise<InvokeResult>;

  'saves:writeSram': (profileId: string, data: ArrayBuffer) => Promise<void>;
  'saves:readSram': (profileId: string) => Promise<ArrayBuffer | null>;
  'saves:writeState': (profileId: string, slot: number, data: ArrayBuffer) => Promise<void>;
  'saves:readState': (profileId: string, slot: number) => Promise<ArrayBuffer | null>;
  'saves:listStates': (profileId: string) => Promise<number[]>;
  'saves:writeScreenshot': (profileId: string, slot: number, data: ArrayBuffer) => Promise<void>;
  'saves:readScreenshot': (profileId: string, slot: number) => Promise<string | null>;
  'saves:getSlotInfos': (profileId: string) => Promise<QuickSaveSlotInfo[]>;

  'saves:normal:create': (profileId: string, name: string, data: ArrayBuffer, screenshot?: ArrayBuffer) => Promise<NormalSaveInfo>;
  'saves:normal:list': (profileId: string) => Promise<NormalSaveInfo[]>;
  'saves:normal:load': (profileId: string, id: string) => Promise<ArrayBuffer | null>;
  'saves:normal:screenshot': (profileId: string, id: string) => Promise<string | null>;
  'saves:normal:overwrite': (profileId: string, id: string, data: ArrayBuffer, screenshot?: ArrayBuffer) => Promise<NormalSaveInfo | null>;
  'saves:normal:delete': (profileId: string, id: string) => Promise<void>;
  'saves:normal:rename': (profileId: string, id: string, newName: string) => Promise<NormalSaveInfo | null>;

  'saves:auto:create': (profileId: string, trigger: 'timer' | 'quit', data: ArrayBuffer, screenshot?: ArrayBuffer) => Promise<AutoSaveInfo>;
  'saves:auto:list': (profileId: string) => Promise<AutoSaveInfo[]>;
  'saves:auto:load': (profileId: string, id: string) => Promise<ArrayBuffer | null>;
  'saves:auto:screenshot': (profileId: string, id: string) => Promise<string | null>;
  'saves:auto:delete': (profileId: string, id: string) => Promise<void>;
  'saves:auto:prune': (profileId: string, maxEntries: number) => Promise<void>;

  'config:read': (profileId: string) => Promise<Record<string, unknown> | null>;
  'config:write': (profileId: string, settings: Record<string, unknown>) => Promise<void>;

  'sessions:list': (profileId: string) => Promise<PlaySession[]>;
  'sessions:save': (profileId: string, session: PlaySession) => Promise<void>;
  'tracker:save': (profileId: string, state: unknown) => Promise<void>;
  'tracker:load': (profileId: string) => Promise<unknown>;

  'inputProfiles:read': (profileId: string) => Promise<unknown[]>;
  'inputProfiles:write': (profileId: string, profiles: unknown[]) => Promise<void>;
  'stickCalibration:read': () => Promise<Record<string, unknown>>;
  'stickCalibration:write': (store: Record<string, unknown>) => Promise<void>;
  'triggerCalibration:read': () => Promise<Record<string, TriggerCal>>;
  'triggerCalibration:write': (deviceKey: string, axisIndex: number, cal: TriggerCal) => Promise<void>;

  'sprites:extract': (romFile: string) => Promise<{ success: boolean; count?: number; error?: string }>;
  'sprites:check': (romFile: string) => Promise<{ extracted: boolean; count: number }>;
  'sprites:delete': (romFile: string) => Promise<InvokeResult>;
  'sprites:getPath': (romFile: string, file: string) => Promise<string>;
}

export type { ProfileDataInvokeContract };
