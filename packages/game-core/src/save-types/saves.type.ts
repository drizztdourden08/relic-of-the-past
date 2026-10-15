/* @layer shared-types @kind types */
interface QuickSaveSlotInfo {
  slot: number;
  timestamp: number;
  size: number;
  hasScreenshot: boolean;
}

interface NormalSaveInfo {
  id: string;
  name: string;
  timestamp: number;
  size: number;
  hasScreenshot: boolean;
}

interface AutoSaveInfo {
  id: string;
  timestamp: number;
  size: number;
  trigger: 'timer' | 'quit';
  hasScreenshot: boolean;
}

export type { AutoSaveInfo, NormalSaveInfo, QuickSaveSlotInfo };
