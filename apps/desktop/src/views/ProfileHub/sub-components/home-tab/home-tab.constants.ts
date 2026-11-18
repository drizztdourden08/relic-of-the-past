/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { RunKind } from '@rotp/game-data';
import type { ArmedAction } from '@app/compounds/ArmedActionButton';
import type { ProfileModeId } from '../../../../compounds/ModeBadge';

const QUICK_SAVE_SLOTS = 12;
const BOOT_WAIT_MS = 120_000;
const SESSION_LIST_LIMIT = 20;
const TOAST_DURATION_MS = 4000;
const SRAM_BYTES = 8192;
const IMPORT_CONFIRM_WORD = 'import';
const SRAM_EXTENSIONS = ['srm', 'sav', 'dat'];

const ARMED_PROMPTS: Readonly<Record<ArmedAction, Message>> = {
  load: msg('profiles:home.armed.load'),
  save: msg('profiles:home.armed.save'),
  delete: msg('profiles:home.armed.delete'),
};

const RUN_OF_MODE: Readonly<Record<ProfileModeId, RunKind | null>> = {
  vanilla: 'normal',
  'vanilla-safe': null,
  randomizer: 'seed',
  'randomizer-online': 'online',
  'randomizer-archipelia': null,
};

export {
  ARMED_PROMPTS, BOOT_WAIT_MS, IMPORT_CONFIRM_WORD, QUICK_SAVE_SLOTS, RUN_OF_MODE, SESSION_LIST_LIMIT, SRAM_BYTES,
  SRAM_EXTENSIONS, TOAST_DURATION_MS,
};
