/// <reference types="vite/client" />

// WebHID API type declarations (Chromium/Electron)
interface HIDDevice {
  readonly opened: boolean;
  readonly vendorId: number;
  readonly productId: number;
  readonly productName: string;
  readonly collections: HIDCollectionInfo[];
  open(): Promise<void>;
  close(): Promise<void>;
  sendReport(reportId: number, data: BufferSource): Promise<void>;
  sendFeatureReport(reportId: number, data: BufferSource): Promise<void>;
  receiveFeatureReport(reportId: number): Promise<DataView>;
  addEventListener(type: 'inputreport', listener: (event: HIDInputReportEvent) => void): void;
  removeEventListener(type: 'inputreport', listener: (event: HIDInputReportEvent) => void): void;
}

interface HIDCollectionInfo {
  usagePage: number;
  usage: number;
  type: number;
  children: HIDCollectionInfo[];
  inputReports: HIDReportInfo[];
  outputReports: HIDReportInfo[];
  featureReports: HIDReportInfo[];
}

interface HIDReportInfo {
  reportId: number;
  items: HIDReportItem[];
}

interface HIDReportItem {
  isAbsolute: boolean;
  isArray: boolean;
  isRange: boolean;
  hasNull: boolean;
  usages: number[];
  usageMinimum: number;
  usageMaximum: number;
  reportSize: number;
  reportCount: number;
  logicalMinimum: number;
  logicalMaximum: number;
}

interface HIDInputReportEvent extends Event {
  readonly device: HIDDevice;
  readonly reportId: number;
  readonly data: DataView;
}

interface HIDDeviceFilter {
  vendorId?: number;
  productId?: number;
  usagePage?: number;
  usage?: number;
}

interface HIDDeviceRequestOptions {
  filters: HIDDeviceFilter[];
}

interface HID extends EventTarget {
  getDevices(): Promise<HIDDevice[]>;
  requestDevice(options: HIDDeviceRequestOptions): Promise<HIDDevice[]>;
  addEventListener(type: 'connect', listener: (event: { device: HIDDevice }) => void): void;
  addEventListener(type: 'disconnect', listener: (event: { device: HIDDevice }) => void): void;
}

interface Navigator {
  readonly hid: HID;
}

interface Profile {
  id: string;
  name: string;
  romFile: string;
  created: number;
  lastPlayed: number;
  language?: string;
  msuPack?: string;
}

interface AppState {
  lastProfileId: string | null;
}

interface ImportResult {
  success: boolean;
  romFile: string;
  error?: string;
  alreadyExists?: boolean;
}

interface RomInfo {
  romFile: string;
  hasAssets: boolean;
  assetSize: number | null;
}

type RomExtractionStatus = 'idle' | 'extracting' | 'ready' | 'failed';

interface RomDisplayInfo extends RomInfo {
  extractionStatus: RomExtractionStatus;
}

interface ElectronAPI {
  // File path helper
  getFilePath(file: File): string;

  // Window controls
  minimize(): void;
  maximize(): void;
  close(): void;
  isMaximized(): Promise<boolean>;
  setAlwaysOnTop(value: boolean): Promise<boolean>;
  setAudioMuted(value: boolean): Promise<boolean>;
  isAudioMuted(): Promise<boolean>;
  onMaximizedChange(callback: (maximized: boolean) => void): () => void;
  toggleFullscreen(): void;
  setFullscreen(value: boolean): void;
  setAspectRatioLock(ratio: number, extraHeight: number): void;
  isFullscreen(): Promise<boolean>;
  onFullscreenChange(callback: (fullscreen: boolean) => void): () => void;

  // File dialog
  openRomDialog(): Promise<string | null>;

  // Profiles
  listProfiles(): Promise<Profile[]>;
  createProfile(name: string, romFile: string, language?: string, msuPack?: string): Promise<Profile>;
  deleteProfile(id: string): Promise<void>;
  setLastProfile(id: string): Promise<void>;
  getAppState(): Promise<AppState>;
  updateLastPlayed(id: string): Promise<void>;

  // ROMs
  listRoms(): Promise<string[]>;
  listRomsWithStatus(): Promise<RomInfo[]>;
  importRom(romPath: string): Promise<ImportResult>;
  importRomUrl(url: string): Promise<ImportResult>;
  deleteRom(romFile: string): Promise<void>;

  // Assets (per-ROM)
  checkAssets(romFile: string): Promise<boolean>;
  loadAssets(romFile: string): Promise<ArrayBuffer | null>;
  extractAssets(romFile: string): Promise<{ success: boolean; error?: string }>;

  // IPC log bridge
  onLogEntry(callback: (entry: { channel: string; level: string; message: string }) => void): () => void;

  // Saves
  writeSram(profileId: string, data: ArrayBuffer): Promise<void>;
  readSram(profileId: string): Promise<ArrayBuffer | null>;
  writeState(profileId: string, slot: number, data: ArrayBuffer): Promise<void>;
  readState(profileId: string, slot: number): Promise<ArrayBuffer | null>;
  listStates(profileId: string): Promise<number[]>;
  writeScreenshot(profileId: string, slot: number, data: ArrayBuffer): Promise<void>;
  readScreenshot(profileId: string, slot: number): Promise<string | null>;
  getSlotInfos(profileId: string): Promise<Array<{ slot: number; timestamp: number; size: number; hasScreenshot: boolean }>>;

  // Config (per-profile settings)
  readConfig(profileId: string): Promise<Record<string, unknown> | null>;
  writeConfig(profileId: string, settings: Record<string, unknown>): Promise<void>;

  // MSU import & management
  importMsu(packName: string, url: string): Promise<{ success: boolean; fileCount?: number; error?: string }>;
  importMsuFile(packName: string, filePath: string): Promise<{ success: boolean; fileCount?: number; error?: string }>;
  listMsuPacks(): Promise<Array<{ name: string; fileCount: number; totalSize: number }>>;
  getMsuPackFiles(packName: string): Promise<Array<{ name: string; size: number }>>;
  deleteMsuPack(packName: string): Promise<void>;
  getMsuTrackList(packName: string): Promise<Array<{ fileName: string; trackNum: number; ext: string }>>;
  readMsuTrackFile(packName: string, fileName: string): Promise<ArrayBuffer>;

  // Languages
  listLanguages(): Promise<Array<{ code: string; fileCount: number }>>;
  extractLanguage(romFile: string, langCode: string): Promise<{ success: boolean; error?: string }>;
  extractLanguageFromFile(filePath: string, langCode: string): Promise<{ success: boolean; error?: string }>;
  extractLanguageFromUrl(url: string, langCode: string): Promise<{ success: boolean; error?: string }>;
  deleteLanguage(langCode: string): Promise<void>;
  getDialogue(langCode: string): Promise<string | null>;

  // ROM info
  getRomInfo(romFile: string): Promise<{ name: string; size: number; hash: string; created: string; modified: string } | null>;

  // Profile update
  updateProfile(id: string, patch: Partial<Profile>): Promise<Profile | null>;

  // Play sessions
  listSessions(profileId: string): Promise<Array<{ id: string; profileId: string; startedAt: number; endedAt: number | null; durationMs: number; stats: Record<string, unknown> }>>;
  saveSession(profileId: string, session: { id: string; profileId: string; startedAt: number; endedAt: number | null; durationMs: number; stats: Record<string, unknown> }): Promise<void>;

  // Tracker state
  saveTrackerState(profileId: string, state: unknown): Promise<void>;
  loadTrackerState(profileId: string): Promise<unknown | null>;

  // Input profiles
  readInputProfiles(profileId: string): Promise<unknown[]>;
  writeInputProfiles(profileId: string, profiles: unknown[]): Promise<void>;

  // HID device enumeration
  enumerateHidDevices(): Promise<Array<{ vendorId: string; productId: string; product: string; manufacturer: string; path: string; serialNumber: string | null }>>;

  // HID input reading (for controllers that use direct HID)
  getHidInputStates(): Promise<Array<{ deviceKey: string; buttons: boolean[]; axes: number[]; timestamp: number }>>;
  getHidDiagLog(): Promise<Array<{ time: number; level: string; message: string }>>;
  onHidInput(callback: (state: { deviceKey: string; buttons: boolean[]; axes: number[]; timestamp: number }) => void): () => void;
  onHidDiag(callback: (entry: { time: number; level: string; message: string }) => void): () => void;
  // App info
  getUserDataPath(): Promise<string>;
}

declare function Zelda3(config: Record<string, unknown>): Promise<unknown>;

interface Window {
  api: ElectronAPI;
}
