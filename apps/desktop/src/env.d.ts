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

interface HIDConnectionEvent extends Event {
  readonly device: HIDDevice;
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
  addEventListener(type: 'connect', listener: (event: HIDConnectionEvent) => void): void;
  addEventListener(type: 'disconnect', listener: (event: HIDConnectionEvent) => void): void;
}

// WebUSB API type declarations (Chromium/Electron)
interface USBDeviceFilter {
  vendorId?: number;
  productId?: number;
  classCode?: number;
  subclassCode?: number;
  protocolCode?: number;
  serialNumber?: string;
}

interface USBDeviceRequestOptions {
  filters: USBDeviceFilter[];
}

interface USBEndpoint {
  readonly endpointNumber: number;
  readonly direction: 'in' | 'out';
  readonly type: 'bulk' | 'interrupt' | 'isochronous';
  readonly packetSize: number;
}

interface USBAlternateInterface {
  readonly alternateSetting: number;
  readonly interfaceClass: number;
  readonly interfaceSubclass: number;
  readonly interfaceProtocol: number;
  readonly interfaceName: string | undefined;
  readonly endpoints: USBEndpoint[];
}

interface USBInterface {
  readonly interfaceNumber: number;
  readonly alternate: USBAlternateInterface;
  readonly alternates: USBAlternateInterface[];
  readonly claimed: boolean;
}

interface USBConfiguration {
  readonly configurationValue: number;
  readonly configurationName: string | undefined;
  readonly interfaces: USBInterface[];
}

interface USBOutTransferResult {
  readonly bytesWritten: number;
  readonly status: 'ok' | 'stall' | 'babble';
}

interface USBInTransferResult {
  readonly data: DataView | undefined;
  readonly status: 'ok' | 'stall' | 'babble';
}

interface USBDevice {
  readonly vendorId: number;
  readonly productId: number;
  readonly deviceClass: number;
  readonly deviceSubclass: number;
  readonly deviceProtocol: number;
  readonly productName: string | undefined;
  readonly manufacturerName: string | undefined;
  readonly serialNumber: string | undefined;
  readonly configuration: USBConfiguration | null;
  readonly configurations: USBConfiguration[];
  readonly opened: boolean;
  open(): Promise<void>;
  close(): Promise<void>;
  selectConfiguration(configurationValue: number): Promise<void>;
  claimInterface(interfaceNumber: number): Promise<void>;
  releaseInterface(interfaceNumber: number): Promise<void>;
  transferOut(endpointNumber: number, data: ArrayBuffer | ArrayBufferView): Promise<USBOutTransferResult>;
  transferIn(endpointNumber: number, length: number): Promise<USBInTransferResult>;
}

interface USB extends EventTarget {
  getDevices(): Promise<USBDevice[]>;
  requestDevice(options: USBDeviceRequestOptions): Promise<USBDevice>;
}

interface Navigator {
  readonly hid: HID;
  readonly usb: USB;
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
  // Dev mode flag
  isDev: boolean;

  // Sprites base URL (per-ROM: file:// path to userData/Data/sprites/{romStem}/)
  getSpritesBaseUrl(romFile: string): string;

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
  openDevTools(): void;
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

  // Stick calibration (global per-device VID:PID)
  readStickCalibration(): Promise<Record<string, unknown>>;
  writeStickCalibration(store: Record<string, unknown>): Promise<void>;

  // HID device enumeration
  enumerateHidDevices(): Promise<Array<{ vendorId: string; productId: string; product: string; manufacturer: string; path: string; serialNumber: string | null }>>;

  // HID write (haptics, LED control via node-hid)
  writeHidDevice(deviceKey: string, data: number[]): Promise<boolean>;
  vibrateHid(deviceKey: string, durationMs: number, intensity: number): Promise<boolean>;
  vibratePattern(deviceKey: string, pattern: { durationMs: number; intensity: number }[], gapMs: number): Promise<{ ok: boolean; error?: string }>;
  testVibration(deviceKey: string): Promise<boolean>;

  // HID input reports from main process (node-hid reader)
  onHidReport(callback: (report: { deviceKey: string; vendorId: number; productId: number; data: number[] }) => void): () => void;
  onHidDeviceOpened(callback: (info: { deviceKey: string; vendorId: string; productId: string; product: string }) => void): () => void;
  onHidDisconnect(callback: (info: { deviceKey: string; product: string; error?: string }) => void): () => void;
  onHidError(callback: (info: { deviceKey: string; error: string }) => void): () => void;

  // App info
  getUserDataPath(): Promise<string>;

  // Sprite debug (item→sprite mapping review)
  loadSpriteDebug(): Promise<Record<string, { status: string; comment?: string }>>;
  saveSpriteDebug(data: Record<string, { status: string; comment?: string }>): Promise<void>;

  // Sprite review (per-sprite image review)
  loadSpriteReview(): Promise<Record<string, { status: string; comment?: string }>>;
  saveSpriteReview(data: Record<string, { status: string; comment?: string }>): Promise<void>;

  // Sprite extraction (per-ROM)
  extractSprites(romFile: string): Promise<{ success: boolean; count?: number; error?: string }>;
  checkSpritesExtracted(romFile: string): Promise<{ extracted: boolean; count: number }>;
  deleteSprites(romFile: string): Promise<{ success: boolean; error?: string }>;
  getSpritePath(romFile: string, file: string): Promise<string>;
}

declare function Zelda3(config: Record<string, unknown>): Promise<unknown>;

interface Window {
  api: ElectronAPI;
}
