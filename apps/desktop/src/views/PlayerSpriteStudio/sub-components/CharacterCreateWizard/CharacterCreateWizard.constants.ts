/* @layer renderer-components @kind constants */
import type { CharacterSource, CharacterWizardValues } from './CharacterCreateWizard.type';

const NEW_SPRITE_ID = '';

const STEP_IDS = { source: 'source', create: 'create', import: 'import' } as const;

const SOURCE_ORDER: readonly CharacterSource[] = ['blank', 'import'];

const INITIAL_VALUES: CharacterWizardValues = { source: 'blank' };

export { INITIAL_VALUES, NEW_SPRITE_ID, SOURCE_ORDER, STEP_IDS };
