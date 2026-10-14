/* @layer renderer-components @kind constants */
import { loadState, saveState } from '../../game';
import type { HintAction, SlotActionSpec } from './SaveStateOverlay.type';

const SLOT_COUNT = 12;
const SHORTCUT_KEYS = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'];
const ANIM_MS = 180;
const TAP_THRESHOLD_MS = 180;

const SLOT_ACTIONS: readonly SlotActionSpec[] = [
  { prefix: 'load-state', label: 'LoadState', verb: 'Loading', run: loadState },
  { prefix: 'save-state', label: 'SaveState', verb: 'Saving', run: saveState },
];

const HINT_LABELS: Record<HintAction, string> = {
  'tap-load': 'Tap to load',
  'hold-save': 'Hold to save',
  'holding-save': 'Saving...',
  'esc-cancel': 'Cancel',
};

export { HINT_LABELS, SLOT_COUNT, SHORTCUT_KEYS, ANIM_MS, TAP_THRESHOLD_MS, SLOT_ACTIONS };
