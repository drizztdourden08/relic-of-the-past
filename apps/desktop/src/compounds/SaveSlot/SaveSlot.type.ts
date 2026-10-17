/* @layer renderer-components @kind types */
import type { ArmedAction } from '../ArmedActionButton';

interface SaveSlotProps {
  slot: number;
  screenshotUrl: string | null;
  timestamp: number;
  isEmpty: boolean;
  busy: boolean;
  shortcutKey?: string;
  disableSave?: boolean;
  disableLoad?: boolean;
  highlighted?: boolean;
  holdProgress?: number;
  onSave: (slot: number) => void;
  onLoad: (slot: number) => void;
}

interface SlotScreenshotProps {
  screenshotUrl: string | null;
  isEmpty: boolean;
  slotNumber: number;
}

interface SlotTimeProps {
  timestamp: number;
}

interface SlotActionsProps {
  slot: number;
  slotNumber: number;
  shortcutKey?: string;
  isEmpty: boolean;
  busy: boolean;
  disableSave?: boolean;
  disableLoad?: boolean;
  armed: ArmedAction | null;
  press: (action: ArmedAction, perform: () => void) => void;
  disarm: () => void;
  onSave: (slot: number) => void;
  onLoad: (slot: number) => void;
}

export type {
  SaveSlotProps,
  SlotActionsProps,
  SlotScreenshotProps,
  SlotTimeProps,
};
