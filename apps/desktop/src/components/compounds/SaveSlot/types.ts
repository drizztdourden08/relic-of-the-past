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

export type {
  SaveSlotProps,
};
