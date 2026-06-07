/* @layer shared-types @kind types */
import type { ButtonIcon, InputBinding } from './bindings';

// ── Function Actions (Shortcuts & Cheats) ──

const SHORTCUT_ACTIONS = [
  'save-state-1', 'save-state-2', 'save-state-3', 'save-state-4',
  'save-state-5', 'save-state-6', 'save-state-7', 'save-state-8',
  'save-state-9', 'save-state-10', 'save-state-11', 'save-state-12',
  'load-state-1', 'load-state-2', 'load-state-3', 'load-state-4',
  'load-state-5', 'load-state-6', 'load-state-7', 'load-state-8',
  'load-state-9', 'load-state-10', 'load-state-11', 'load-state-12',
  'pause', 'reset',
  'fullscreen', 'turbo',
] as const;

const CHEAT_ACTIONS = [
  'cheat-health', 'cheat-equipment', 'cheat-keys', 'cheat-noclip',
] as const;

const FUNCTION_ACTIONS = [...SHORTCUT_ACTIONS, ...CHEAT_ACTIONS] as const;

type FunctionAction = (typeof FUNCTION_ACTIONS)[number];

const FUNCTION_ACTION_LABELS: Record<FunctionAction, string> = {
  'save-state-1': 'Save State 1',
  'save-state-2': 'Save State 2',
  'save-state-3': 'Save State 3',
  'save-state-4': 'Save State 4',
  'save-state-5': 'Save State 5',
  'save-state-6': 'Save State 6',
  'save-state-7': 'Save State 7',
  'save-state-8': 'Save State 8',
  'save-state-9': 'Save State 9',
  'save-state-10': 'Save State 10',
  'save-state-11': 'Save State 11',
  'save-state-12': 'Save State 12',
  'load-state-1': 'Load State 1',
  'load-state-2': 'Load State 2',
  'load-state-3': 'Load State 3',
  'load-state-4': 'Load State 4',
  'load-state-5': 'Load State 5',
  'load-state-6': 'Load State 6',
  'load-state-7': 'Load State 7',
  'load-state-8': 'Load State 8',
  'load-state-9': 'Load State 9',
  'load-state-10': 'Load State 10',
  'load-state-11': 'Load State 11',
  'load-state-12': 'Load State 12',
  'pause': 'Pause',
  'reset': 'Reset',
  'fullscreen': 'Fullscreen',
  'turbo': 'Turbo',
  'cheat-health': 'Restore Health',
  'cheat-equipment': 'Restore Equipment',
  'cheat-keys': 'Give All Keys',
  'cheat-noclip': 'Walk Through Walls',
};

interface FunctionMapping {
  action: FunctionAction;
  binding: InputBinding;
  icon: ButtonIcon | null;
  sourceVid?: string | null;
  sourcePid?: string | null;
}

const DEFAULT_FUNCTION_MAPPINGS: FunctionMapping[] = [
  { action: 'save-state-1', binding: { type: 'keyboard', code: 'F1', modifiers: { shift: true } }, icon: null },
  { action: 'save-state-2', binding: { type: 'keyboard', code: 'F2', modifiers: { shift: true } }, icon: null },
  { action: 'save-state-3', binding: { type: 'keyboard', code: 'F3', modifiers: { shift: true } }, icon: null },
  { action: 'save-state-4', binding: { type: 'keyboard', code: 'F4', modifiers: { shift: true } }, icon: null },
  { action: 'save-state-5', binding: { type: 'none' }, icon: null },
  { action: 'save-state-6', binding: { type: 'none' }, icon: null },
  { action: 'save-state-7', binding: { type: 'none' }, icon: null },
  { action: 'save-state-8', binding: { type: 'none' }, icon: null },
  { action: 'save-state-9', binding: { type: 'none' }, icon: null },
  { action: 'save-state-10', binding: { type: 'none' }, icon: null },
  { action: 'save-state-11', binding: { type: 'none' }, icon: null },
  { action: 'save-state-12', binding: { type: 'none' }, icon: null },
  { action: 'load-state-1', binding: { type: 'keyboard', code: 'F1' }, icon: null },
  { action: 'load-state-2', binding: { type: 'keyboard', code: 'F2' }, icon: null },
  { action: 'load-state-3', binding: { type: 'keyboard', code: 'F3' }, icon: null },
  { action: 'load-state-4', binding: { type: 'keyboard', code: 'F4' }, icon: null },
  { action: 'load-state-5', binding: { type: 'none' }, icon: null },
  { action: 'load-state-6', binding: { type: 'none' }, icon: null },
  { action: 'load-state-7', binding: { type: 'none' }, icon: null },
  { action: 'load-state-8', binding: { type: 'none' }, icon: null },
  { action: 'load-state-9', binding: { type: 'none' }, icon: null },
  { action: 'load-state-10', binding: { type: 'none' }, icon: null },
  { action: 'load-state-11', binding: { type: 'none' }, icon: null },
  { action: 'load-state-12', binding: { type: 'none' }, icon: null },
  { action: 'pause', binding: { type: 'keyboard', code: 'F10' }, icon: null },
  { action: 'reset', binding: { type: 'keyboard', code: 'KeyR', modifiers: { ctrl: true } }, icon: null },
  { action: 'fullscreen', binding: { type: 'keyboard', code: 'Enter', modifiers: { alt: true } }, icon: null },
  { action: 'turbo', binding: { type: 'keyboard', code: 'Tab' }, icon: null },
  { action: 'cheat-health', binding: { type: 'keyboard', code: 'KeyW' }, icon: null },
  { action: 'cheat-equipment', binding: { type: 'keyboard', code: 'KeyW', modifiers: { shift: true } }, icon: null },
  { action: 'cheat-keys', binding: { type: 'keyboard', code: 'KeyO' }, icon: null },
  { action: 'cheat-noclip', binding: { type: 'keyboard', code: 'KeyE', modifiers: { ctrl: true } }, icon: null },
];

export { CHEAT_ACTIONS, DEFAULT_FUNCTION_MAPPINGS, FUNCTION_ACTIONS, FUNCTION_ACTION_LABELS, SHORTCUT_ACTIONS };
export type { FunctionAction, FunctionMapping };
