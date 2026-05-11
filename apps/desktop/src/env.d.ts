/// <reference types="vite/client" />

interface Profile {
  id: string;
  name: string;
  romFile: string;
  created: number;
  lastPlayed: number;
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
  // Window controls
  minimize(): void;
  maximize(): void;
  close(): void;
  isMaximized(): Promise<boolean>;
  setAlwaysOnTop(value: boolean): Promise<boolean>;
  setAudioMuted(value: boolean): Promise<boolean>;
  isAudioMuted(): Promise<boolean>;
  onMaximizedChange(callback: (maximized: boolean) => void): () => void;

  // File dialog
  openRomDialog(): Promise<string | null>;

  // Profiles
  listProfiles(): Promise<Profile[]>;
  createProfile(name: string, romFile: string): Promise<Profile>;
  deleteProfile(id: string): Promise<void>;
  setLastProfile(id: string): Promise<void>;
  getAppState(): Promise<AppState>;
  updateLastPlayed(id: string): Promise<void>;

  // ROMs
  listRoms(): Promise<string[]>;
  listRomsWithStatus(): Promise<RomInfo[]>;
  importRom(romPath: string): Promise<ImportResult>;
  deleteRom(romFile: string): Promise<void>;

  // Assets (per-ROM)
  checkAssets(romFile: string): Promise<boolean>;
  loadAssets(romFile: string): Promise<ArrayBuffer | null>;
  extractAssets(romFile: string): Promise<{ success: boolean; error?: string }>;

  // IPC log bridge
  onLogEntry(callback: (entry: { channel: string; level: string; message: string }) => void): () => void;

  // App info
  getUserDataPath(): Promise<string>;
}

declare function Zelda3(config: Record<string, unknown>): Promise<unknown>;

interface Window {
  api: ElectronAPI;
}
