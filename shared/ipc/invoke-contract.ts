/* @layer shared-types @kind logic */
/**
 * Request/response IPC channels: `ipcRenderer.invoke` ↔ `ipcMain.handle`.
 * This interface is the SINGLE SOURCE OF TRUTH for every invoke channel's
 * argument + return signature. Both the preload bridge and the main-process
 * handlers are type-checked against it.
 */
import type { Profile, AppState } from '@shared/types/profile';
import type { NormalSaveInfo, AutoSaveInfo, QuickSaveSlotInfo } from '@shared/types/saves';
import type { PlaySession } from '@shared/types/session';
import type { ShadowCastingProject, ScreenShadowData } from '@shared/types/shadow-casting';

type Result = { success: boolean; error?: string };
type MsuResult = { success: boolean; fileCount?: number; error?: string };
type TriggerCal = { base: number; max: number; deadzone: number };
type ReviewMap = Record<string, { status: string; comment?: string }>;

interface InvokeContract {
  // App
  'app:getUserDataPath': () => Promise<string>;

  // WASM core bytes — renderer instantiates non-streaming (file:// can't fetch)
  'wasm:readBytes': () => Promise<ArrayBuffer>;

  // Window queries
  'window:isMaximized': () => Promise<boolean>;
  'window:setAlwaysOnTop': (value: boolean) => Promise<boolean>;
  'window:setAudioMuted': (value: boolean) => Promise<boolean>;
  'window:isAudioMuted': () => Promise<boolean>;
  'window:isFullscreen': () => Promise<boolean>;

  // Dialog
  'dialog:openRom': () => Promise<string | null>;

  // Profiles
  'profiles:list': () => Promise<Profile[]>;
  'profiles:create': (name: string, romFile: string, language?: string, msuPack?: string) => Promise<Profile>;
  'profiles:delete': (id: string) => Promise<void>;
  'profiles:setLast': (id: string) => Promise<void>;
  'profiles:getAppState': () => Promise<AppState>;
  'profiles:updateLastPlayed': (id: string) => Promise<void>;
  'profiles:update': (id: string, patch: Partial<Profile>) => Promise<Profile | null>;

  // ROMs
  'roms:list': () => Promise<string[]>;
  'roms:listWithStatus': () => Promise<RomInfo[]>;
  'roms:import': (romPath: string) => Promise<ImportResult>;
  'roms:importUrl': (url: string) => Promise<ImportResult>;
  'roms:delete': (romFile: string) => Promise<void>;
  'roms:getInfo': (romFile: string) => Promise<{ name: string; size: number; hash: string; created: string; modified: string } | null>;

  // Assets
  'assets:check': (romFile: string) => Promise<boolean>;
  'assets:load': (romFile: string) => Promise<ArrayBuffer | null>;
  'assets:extract': (romFile: string) => Promise<Result>;

  // Saves — quick states
  'saves:writeSram': (profileId: string, data: ArrayBuffer) => Promise<void>;
  'saves:readSram': (profileId: string) => Promise<ArrayBuffer | null>;
  'saves:writeState': (profileId: string, slot: number, data: ArrayBuffer) => Promise<void>;
  'saves:readState': (profileId: string, slot: number) => Promise<ArrayBuffer | null>;
  'saves:listStates': (profileId: string) => Promise<number[]>;
  'saves:writeScreenshot': (profileId: string, slot: number, data: ArrayBuffer) => Promise<void>;
  'saves:readScreenshot': (profileId: string, slot: number) => Promise<string | null>;
  'saves:getSlotInfos': (profileId: string) => Promise<QuickSaveSlotInfo[]>;

  // Saves — normal (named)
  'saves:normal:create': (profileId: string, name: string, data: ArrayBuffer, screenshot?: ArrayBuffer) => Promise<NormalSaveInfo>;
  'saves:normal:list': (profileId: string) => Promise<NormalSaveInfo[]>;
  'saves:normal:load': (profileId: string, id: string) => Promise<ArrayBuffer | null>;
  'saves:normal:screenshot': (profileId: string, id: string) => Promise<string | null>;
  'saves:normal:overwrite': (profileId: string, id: string, data: ArrayBuffer, screenshot?: ArrayBuffer) => Promise<NormalSaveInfo | null>;
  'saves:normal:delete': (profileId: string, id: string) => Promise<void>;
  'saves:normal:rename': (profileId: string, id: string, newName: string) => Promise<NormalSaveInfo | null>;

  // Saves — auto
  'saves:auto:create': (profileId: string, trigger: 'timer' | 'quit', data: ArrayBuffer, screenshot?: ArrayBuffer) => Promise<AutoSaveInfo>;
  'saves:auto:list': (profileId: string) => Promise<AutoSaveInfo[]>;
  'saves:auto:load': (profileId: string, id: string) => Promise<ArrayBuffer | null>;
  'saves:auto:screenshot': (profileId: string, id: string) => Promise<string | null>;
  'saves:auto:delete': (profileId: string, id: string) => Promise<void>;
  'saves:auto:prune': (profileId: string, maxEntries: number) => Promise<void>;

  // Config (per-profile settings)
  'config:read': (profileId: string) => Promise<Record<string, unknown> | null>;
  'config:write': (profileId: string, settings: Record<string, unknown>) => Promise<void>;

  // MSU
  'msu:import': (packName: string, url: string) => Promise<MsuResult>;
  'msu:importFile': (packName: string, filePath: string) => Promise<MsuResult>;
  'msu:listPacks': () => Promise<Array<{ name: string; fileCount: number; totalSize: number }>>;
  'msu:getPackFiles': (packName: string) => Promise<Array<{ name: string; size: number }>>;
  'msu:deletePack': (packName: string) => Promise<void>;
  'msu:getTrackList': (packName: string) => Promise<Array<{ fileName: string; trackNum: number; ext: string }>>;
  'msu:readTrackFile': (packName: string, fileName: string) => Promise<ArrayBuffer>;

  // Languages
  'languages:list': () => Promise<Array<{ code: string; fileCount: number }>>;
  'languages:extract': (romFile: string, langCode: string) => Promise<Result>;
  'languages:extractFromFile': (filePath: string, langCode: string) => Promise<Result>;
  'languages:extractFromUrl': (url: string, langCode: string) => Promise<Result>;
  'languages:delete': (langCode: string) => Promise<void>;
  'languages:getDialogue': (langCode: string) => Promise<string | null>;

  // Sessions + tracker
  'sessions:list': (profileId: string) => Promise<PlaySession[]>;
  'sessions:save': (profileId: string, session: PlaySession) => Promise<void>;
  'tracker:save': (profileId: string, state: unknown) => Promise<void>;
  'tracker:load': (profileId: string) => Promise<unknown>;

  // Input — profiles + calibration + HID
  'inputProfiles:read': (profileId: string) => Promise<unknown[]>;
  'inputProfiles:write': (profileId: string, profiles: unknown[]) => Promise<void>;
  'stickCalibration:read': () => Promise<Record<string, unknown>>;
  'stickCalibration:write': (store: Record<string, unknown>) => Promise<void>;
  'triggerCalibration:read': () => Promise<Record<string, TriggerCal>>;
  'triggerCalibration:write': (deviceKey: string, axisIndex: number, cal: TriggerCal) => Promise<void>;
  'hid:enumerate': () => Promise<Array<{ vendorId: string; productId: string; product: string; manufacturer: string; path: string; serialNumber: string | null }>>;
  'hid:get-open-keys': () => Promise<string[]>;
  'hid:write': (deviceKey: string, data: number[]) => Promise<boolean>;
  'hid:vibrate': (deviceKey: string, durationMs: number, intensity: number) => Promise<boolean>;
  'hid:vibrate-pattern': (deviceKey: string, pattern: { durationMs: number; intensity: number }[], gapMs: number) => Promise<{ ok: boolean; error?: string }>;

  // Sprites
  'sprites:extract': (romFile: string) => Promise<{ success: boolean; count?: number; error?: string }>;
  'sprites:check': (romFile: string) => Promise<{ extracted: boolean; count: number }>;
  'sprites:delete': (romFile: string) => Promise<Result>;
  'sprites:getPath': (romFile: string, file: string) => Promise<string>;

  // Review data (dev tooling)
  'spriteDebug:load': () => Promise<ReviewMap>;
  'spriteDebug:save': (data: ReviewMap) => Promise<void>;
  'spriteReview:load': () => Promise<ReviewMap>;
  'spriteReview:save': (data: ReviewMap) => Promise<void>;
  'connectionReview:load': () => Promise<unknown>;
  'connectionReview:save': (data: unknown) => Promise<void>;
  'navReview:load': () => Promise<unknown>;
  'navReview:save': (data: unknown) => Promise<void>;

  // Test automation
  'test:getArgs': () => Promise<{ autoState: number | null; screenshot: string | null }>;
  'test:screenshot': (name: string) => Promise<string>;

  // Debug dumps
  'debug:getDumpLayersSlot': () => Promise<number | null>;
  'debug:getHoverTile': () => Promise<{ col: number; row: number } | null>;
  'debug:dumpLayers': (data: unknown) => Promise<string>;
  'debug:getDumpNavSlot': () => Promise<number | null>;
  'debug:dumpNav': (data: unknown) => Promise<string>;

  // Shadow casting (nested namespace in the friendly API)
  'shadow-casting:load': () => Promise<ShadowCastingProject>;
  'shadow-casting:save': (data: ShadowCastingProject) => Promise<{ success: boolean }>;
  'shadow-casting:get-screen': (screenId: number) => Promise<ScreenShadowData | null>;

  // Screen editor (dev-only, nested namespace)
  'screenEditor:writeScreen': (args: { filePath: string; code: string; screenId: string | null }) => Promise<Result>;
  'screenEditor:writeConnections': (args: { filePath: string; code: string }) => Promise<Result>;
  'screenEditor:appendRegistry': (args: { type: 'area' | 'location'; entries: Array<{ id: string; name: string; world?: string; areaId?: string }> }) => Promise<Result>;

  // Auto-updater (nested namespace)
  'updater:isPortable': () => Promise<boolean>;
  'updater:check': () => Promise<unknown>;
  'updater:getAvailable': () => Promise<{ version: string; releaseNotes: string; releaseDate: string } | null>;
  'updater:download': () => Promise<void>;
  'updater:install': () => Promise<void>;
  'updater:getVersion': () => Promise<string>;
}

export type { InvokeContract };
