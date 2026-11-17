/* @layer renderer-components @kind constants */
import type { WizardStepButtons } from '@drizztdourden08/tessera/composites';
import type { CharacterSource, CharacterWizardValues } from './CharacterCreateWizard.type';

const NEW_SPRITE_ID = '';

const STEP_IDS = { source: 'source', create: 'create', import: 'import' } as const;

const STEP_LABELS = { source: 'Source', create: 'Create', import: 'Import' } as const;

const WIZARD_TITLE = 'New character';

const SOURCE_LABELS: Readonly<Record<CharacterSource, string>> = {
  blank: 'Stock sheet',
  import: 'Import a file',
};

const SOURCE_DESCRIPTIONS: Readonly<Record<CharacterSource, string>> = {
  blank: 'Start a new sprite from the stock Link sheet, then recolour it.',
  import: 'Bring in a .zspr or .rsp file from your computer or a download link.',
};

const SOURCE_ORDER: readonly CharacterSource[] = ['blank', 'import'];

const NEEDS_ROM = 'New sprites need a ROM with compiled assets.';

const NOT_IMPORTED = 'Import a sprite first.';

const CREATE_FAILED = 'The stock sheet could not be loaded.';

const CREATE_TEXT = 'The new sprite opens in the editor, where you name it and pick its colours.';

const IMPORTED_TEXT = 'The sprite is saved. Press Done to open it.';

const BUSY_HINT = 'Creating the sprite';

const CREATE_BUTTONS: WizardStepButtons = { next: { label: 'Create sprite' } };

const IMPORT_BUTTONS: WizardStepButtons = { next: { label: 'Done' } };

const INITIAL_VALUES: CharacterWizardValues = { source: 'blank' };

export {
  BUSY_HINT, CREATE_BUTTONS, CREATE_FAILED, CREATE_TEXT, IMPORTED_TEXT, IMPORT_BUTTONS, INITIAL_VALUES, NEEDS_ROM, NEW_SPRITE_ID,
  NOT_IMPORTED, SOURCE_DESCRIPTIONS, SOURCE_LABELS, SOURCE_ORDER, STEP_IDS, STEP_LABELS, WIZARD_TITLE,
};
