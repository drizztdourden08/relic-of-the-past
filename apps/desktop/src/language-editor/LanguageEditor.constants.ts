/* @layer renderer-components @kind constants */
import type { IconName } from '@drizztdourden08/tessera/primitives';
import type { DialogueEntry } from '@rotp/languages';

const NO_ENTRIES: DialogueEntry[] = [];

const LOCKED_ICON: IconName = 'lock';

const VARIABLES_SUMMARY = 'Substitutions are listed and editable here, but nothing reads them yet.';
const TEXT_SUMMARY = 'Every string the game shows is listed here, but none of it is baked yet.';

export { NO_ENTRIES, LOCKED_ICON, VARIABLES_SUMMARY, TEXT_SUMMARY };
