/* @layer renderer-components @kind constants */
import type { DialogueEntry } from '@shared/game/language';

const NO_ENTRIES: DialogueEntry[] = [];

const LOCKED = '🔒';

const VARIABLES_SUMMARY = 'Substitutions are listed and editable here, but nothing reads them yet.';
const TEXT_SUMMARY = 'Every string the game shows is listed here, but none of it is baked yet.';

export { NO_ENTRIES, LOCKED, VARIABLES_SUMMARY, TEXT_SUMMARY };
