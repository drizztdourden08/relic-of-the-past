/* @layer shared-types @kind logic */
/** Quick save slot info (slots 0-11) */
interface QuickSaveSlotInfo {
  slot: number;
  timestamp: number;
  size: number;
  hasScreenshot: boolean;
}

/** Normal (named) save entry */
interface NormalSaveInfo {
  id: string;
  name: string;
  timestamp: number;
  size: number;
  hasScreenshot: boolean;
}

/** Auto-save entry */
interface AutoSaveInfo {
  id: string;
  timestamp: number;
  size: number;
  trigger: 'timer' | 'quit';
  hasScreenshot: boolean;
}

/** Auto-save settings */
interface AutoSaveSettings {
  autoSaveEnabled: boolean;
  autoSaveIntervalSeconds: number; // 60-1800, default 300
  autoSaveMaxEntries: number; // 1-20, default 5
  saveOnQuit: boolean;
}

export type { AutoSaveInfo, AutoSaveSettings, NormalSaveInfo, QuickSaveSlotInfo };
