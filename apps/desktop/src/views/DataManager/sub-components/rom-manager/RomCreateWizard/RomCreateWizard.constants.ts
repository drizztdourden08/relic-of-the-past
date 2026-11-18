/* @layer renderer-components @kind constants */
import type { WizardStepButtons } from '@drizztdourden08/tessera/composites';
import type { RomWizardValues } from './RomCreateWizard.type';

const STEP_IDS = {
  kind: 'kind',
  file: 'file',
  import: 'import',
} as const;

const STEP_LABELS = {
  kind: 'Kind',
  file: 'File',
  import: 'Import',
} as const;

const WIZARD_TITLE = 'New ROM';

const BUSY_HINT = 'Importing the ROM';

const IMPORT_BUTTONS: WizardStepButtons = { next: { label: 'Import' } };

const PROBLEMS = {
  noFile: 'Drop a file or paste its download link.',
  badUrl: 'The download link is not a web address.',
} as const;

const INITIAL_VALUES: RomWizardValues = { kind: 'snes-alttp', file: null, check: null, url: '' };

export { BUSY_HINT, IMPORT_BUTTONS, INITIAL_VALUES, PROBLEMS, STEP_IDS, STEP_LABELS, WIZARD_TITLE };
