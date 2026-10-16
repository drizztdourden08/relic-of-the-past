/* @layer renderer-components @kind constants */
import type { RunKind } from '@rotp/game-data';
import type { ProfileModeId } from '../../../../compounds/ModeBadge';

const QUICK_SAVE_SLOTS = 12;
const BOOT_WAIT_MS = 120_000;
const SESSION_LIST_LIMIT = 20;
const TOAST_DURATION_MS = 4000;
const SRAM_BYTES = 8192;
const IMPORT_CONFIRM_WORD = 'import';
const SRAM_EXTENSIONS = ['srm', 'sav', 'dat'];
const UNDO_WINDOW_MS = 8000;
const LOADED_TOAST_ID = 'save-loaded';
const REPLACED_TOAST_ID = 'save-replaced';

const AUTO_TRIGGER_LABELS = { timer: 'On timer', quit: 'On quit' } as const;

const EMPTY_SAVE_LABEL = 'Empty';

const NO_GAME_REASON = 'Start the game to save';

const STATUS_LABELS = {
  idle: 'Idle',
  starting: 'Starting...',
  active: 'Active',
  reconnecting: 'Reconnecting...',
  error: 'Error',
} as const;

const RUN_OF_MODE: Readonly<Record<ProfileModeId, RunKind | null>> = {
  vanilla: 'normal',
  'vanilla-safe': null,
  randomizer: 'seed',
  'randomizer-online': 'online',
};

export {
  AUTO_TRIGGER_LABELS, BOOT_WAIT_MS, EMPTY_SAVE_LABEL, IMPORT_CONFIRM_WORD, LOADED_TOAST_ID, NO_GAME_REASON, QUICK_SAVE_SLOTS, REPLACED_TOAST_ID, RUN_OF_MODE,
  SESSION_LIST_LIMIT, SRAM_BYTES, SRAM_EXTENSIONS, STATUS_LABELS, TOAST_DURATION_MS, UNDO_WINDOW_MS,
};
