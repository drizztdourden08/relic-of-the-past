/* @layer shared-types @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { FunctionAction, FunctionMapping } from './functions.type';

const SHORTCUT_ACTIONS = [
  'save-state-1', 'save-state-2', 'save-state-3', 'save-state-4',
  'save-state-5', 'save-state-6', 'save-state-7', 'save-state-8',
  'save-state-9', 'save-state-10', 'save-state-11', 'save-state-12',
  'load-state-1', 'load-state-2', 'load-state-3', 'load-state-4',
  'load-state-5', 'load-state-6', 'load-state-7', 'load-state-8',
  'load-state-9', 'load-state-10', 'load-state-11', 'load-state-12',
  'pause', 'reset',
  'fullscreen', 'turbo',
  'profile-next', 'profile-prev',
  'toggle-debug-capture',
] as const;

const CHEAT_ACTIONS = [
  'cheat-health', 'cheat-max-health', 'cheat-ignore-collision', 'cheat-kill-enemies', 'cheat-restore-magic',
] as const;

const FUNCTION_ACTIONS = [...SHORTCUT_ACTIONS, ...CHEAT_ACTIONS] as const;

const FUNCTION_ACTION_LABELS: Record<FunctionAction, Message> = {
  'save-state-1': msg('features:controls.function.saveState', { slot: 1 }),
  'save-state-2': msg('features:controls.function.saveState', { slot: 2 }),
  'save-state-3': msg('features:controls.function.saveState', { slot: 3 }),
  'save-state-4': msg('features:controls.function.saveState', { slot: 4 }),
  'save-state-5': msg('features:controls.function.saveState', { slot: 5 }),
  'save-state-6': msg('features:controls.function.saveState', { slot: 6 }),
  'save-state-7': msg('features:controls.function.saveState', { slot: 7 }),
  'save-state-8': msg('features:controls.function.saveState', { slot: 8 }),
  'save-state-9': msg('features:controls.function.saveState', { slot: 9 }),
  'save-state-10': msg('features:controls.function.saveState', { slot: 10 }),
  'save-state-11': msg('features:controls.function.saveState', { slot: 11 }),
  'save-state-12': msg('features:controls.function.saveState', { slot: 12 }),
  'load-state-1': msg('features:controls.function.loadState', { slot: 1 }),
  'load-state-2': msg('features:controls.function.loadState', { slot: 2 }),
  'load-state-3': msg('features:controls.function.loadState', { slot: 3 }),
  'load-state-4': msg('features:controls.function.loadState', { slot: 4 }),
  'load-state-5': msg('features:controls.function.loadState', { slot: 5 }),
  'load-state-6': msg('features:controls.function.loadState', { slot: 6 }),
  'load-state-7': msg('features:controls.function.loadState', { slot: 7 }),
  'load-state-8': msg('features:controls.function.loadState', { slot: 8 }),
  'load-state-9': msg('features:controls.function.loadState', { slot: 9 }),
  'load-state-10': msg('features:controls.function.loadState', { slot: 10 }),
  'load-state-11': msg('features:controls.function.loadState', { slot: 11 }),
  'load-state-12': msg('features:controls.function.loadState', { slot: 12 }),
  'pause': msg('features:controls.function.pause'),
  'reset': msg('features:controls.function.reset'),
  'fullscreen': msg('features:controls.function.fullscreen'),
  'turbo': msg('features:controls.function.turbo'),
  'profile-next': msg('features:controls.function.profileNext'),
  'profile-prev': msg('features:controls.function.profilePrev'),
  'toggle-debug-capture': msg('features:controls.function.toggleDebugCapture'),
  'cheat-health': msg('features:controls.function.cheatHealth'),
  'cheat-max-health': msg('features:controls.function.cheatMaxHealth'),
  'cheat-ignore-collision': msg('features:controls.function.cheatIgnoreCollision'),
  'cheat-kill-enemies': msg('features:controls.function.cheatKillEnemies'),
  'cheat-restore-magic': msg('features:controls.function.cheatRestoreMagic'),
};

const DEFAULT_FUNCTION_MAPPINGS: FunctionMapping[] = [
  { action: 'save-state-1', binding: { type: 'none' }, icon: null },
  { action: 'save-state-2', binding: { type: 'none' }, icon: null },
  { action: 'save-state-3', binding: { type: 'none' }, icon: null },
  { action: 'save-state-4', binding: { type: 'none' }, icon: null },
  { action: 'save-state-5', binding: { type: 'none' }, icon: null },
  { action: 'save-state-6', binding: { type: 'none' }, icon: null },
  { action: 'save-state-7', binding: { type: 'none' }, icon: null },
  { action: 'save-state-8', binding: { type: 'none' }, icon: null },
  { action: 'save-state-9', binding: { type: 'none' }, icon: null },
  { action: 'save-state-10', binding: { type: 'none' }, icon: null },
  { action: 'save-state-11', binding: { type: 'none' }, icon: null },
  { action: 'save-state-12', binding: { type: 'none' }, icon: null },
  { action: 'load-state-1', binding: { type: 'none' }, icon: null },
  { action: 'load-state-2', binding: { type: 'none' }, icon: null },
  { action: 'load-state-3', binding: { type: 'none' }, icon: null },
  { action: 'load-state-4', binding: { type: 'none' }, icon: null },
  { action: 'load-state-5', binding: { type: 'none' }, icon: null },
  { action: 'load-state-6', binding: { type: 'none' }, icon: null },
  { action: 'load-state-7', binding: { type: 'none' }, icon: null },
  { action: 'load-state-8', binding: { type: 'none' }, icon: null },
  { action: 'load-state-9', binding: { type: 'none' }, icon: null },
  { action: 'load-state-10', binding: { type: 'none' }, icon: null },
  { action: 'load-state-11', binding: { type: 'none' }, icon: null },
  { action: 'load-state-12', binding: { type: 'none' }, icon: null },
  { action: 'pause', binding: { type: 'none' }, icon: null },
  { action: 'reset', binding: { type: 'none' }, icon: null },
  { action: 'fullscreen', binding: { type: 'none' }, icon: null },
  { action: 'turbo', binding: { type: 'none' }, icon: null },
  { action: 'profile-next', binding: { type: 'none' }, icon: null },
  { action: 'profile-prev', binding: { type: 'none' }, icon: null },
  { action: 'toggle-debug-capture', binding: { type: 'keyboard', code: 'Tab' }, icon: null },
  { action: 'cheat-health', binding: { type: 'none' }, icon: null },
  { action: 'cheat-max-health', binding: { type: 'none' }, icon: null },
  { action: 'cheat-ignore-collision', binding: { type: 'none' }, icon: null },
  { action: 'cheat-kill-enemies', binding: { type: 'none' }, icon: null },
  { action: 'cheat-restore-magic', binding: { type: 'none' }, icon: null },
];

export { CHEAT_ACTIONS, DEFAULT_FUNCTION_MAPPINGS, FUNCTION_ACTIONS, FUNCTION_ACTION_LABELS, SHORTCUT_ACTIONS };
