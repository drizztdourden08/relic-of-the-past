/* @layer renderer-components @kind logic */
/**
 * Types and constants for the enhanced save slot state machine.
 */
import type { InputBinding, ButtonIcon } from '@shared/types/controls';

/** Time in ms below which a second press is considered a "tap" → LOAD */
const TAP_THRESHOLD_MS = 180;

type HintAction = 'tap-load' | 'hold-save' | 'esc-cancel' | 'holding-save';

interface SlotHint {
  action: HintAction;
  binding: InputBinding;
  icon: ButtonIcon | null;
}

interface EnhancedSaveSlotState {
  open: boolean;
  highlightedSlot: number | null;
  holdProgress: number;
  hints: SlotHint[];
  close: () => void;
}

export { TAP_THRESHOLD_MS };
export type { HintAction, SlotHint, EnhancedSaveSlotState };
