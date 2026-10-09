/* @layer renderer-components @kind types */
import type { InputBinding, ButtonIcon } from '@rotp/game-data';

type HintAction = 'tap-load' | 'hold-save' | 'esc-cancel' | 'holding-save';

interface SlotHint {
  action: HintAction;
  binding: InputBinding;
  icon: ButtonIcon | null;
}

interface SaveSlotShortcutState {
  open: boolean;
  highlightedSlot: number | null;
  holdProgress: number;
  hints: SlotHint[];
  close: () => void;
}

type BindingInfo = { binding: InputBinding; icon: ButtonIcon | null };

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
  BindingInfo,
  HintAction,
  SaveSlotShortcutState,
  SaveStateOverlayProps,
  SlotHint,
  SlotInfo,
};
