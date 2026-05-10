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

  // Settings
  loadSettings(): Promise<Record<string, unknown>>;
  saveSettings(settings: Record<string, unknown>): Promise<void>;

  // App info
  getUserDataPath(): Promise<string>;
}

declare function Zelda3(config: Record<string, unknown>): Promise<unknown>;

interface Window {
  api: ElectronAPI;
}
