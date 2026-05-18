import type { SlotHint } from './behavior/useEnhancedSaveSlot';

interface SlotInfo {
  slot: number;
  timestamp: number;
  size: number;
  hasScreenshot: boolean;
  screenshotUrl: string | null;
}

interface SaveStateOverlayProps {
  open: boolean;
  onClose: () => void;
  highlightedSlot?: number | null;
  holdProgress?: number;
  hints?: SlotHint[];
}

export type {
  SlotInfo,
  SaveStateOverlayProps,
};
