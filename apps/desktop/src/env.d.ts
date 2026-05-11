/// <reference types="vite/client" />

interface ElectronAPI {
  // Window controls
  minimize(): void;
  maximize(): void;
  close(): void;
  isMaximized(): Promise<boolean>;
  onMaximizedChange(callback: (maximized: boolean) => void): () => void;

  // File dialog
  openRomDialog(): Promise<string | null>;
  readFile(filePath: string): Promise<ArrayBuffer>;

  // Assets
  checkAssets(): Promise<boolean>;
  loadAssets(): Promise<ArrayBuffer | null>;
  saveAssets(buffer: ArrayBuffer): Promise<boolean>;
  checkRom(): Promise<boolean>;

  // Settings
  loadSettings(): Promise<Record<string, unknown>>;
  saveSettings(settings: Record<string, unknown>): Promise<void>;

  // Asset extraction
  extractAssets(romPath: string): Promise<{ success: boolean; error?: string }>;
  onLogEntry(callback: (entry: { channel: string; level: string; message: string }) => void): () => void;

  // App info
  getUserDataPath(): Promise<string>;
}

declare function Zelda3(config: Record<string, unknown>): Promise<unknown>;

interface Window {
  api: ElectronAPI;
}
