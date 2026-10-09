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
const SAVE_NAME_MAX_LENGTH = 64;

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
  BOOT_WAIT_MS, IMPORT_CONFIRM_WORD, QUICK_SAVE_SLOTS, RUN_OF_MODE, SAVE_NAME_MAX_LENGTH,
  SESSION_LIST_LIMIT, SRAM_BYTES, SRAM_EXTENSIONS, STATUS_LABELS, TOAST_DURATION_MS,
};
