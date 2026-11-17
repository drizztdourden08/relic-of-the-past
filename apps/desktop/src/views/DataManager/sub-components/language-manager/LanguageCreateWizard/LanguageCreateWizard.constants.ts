/* @layer renderer-components @kind constants */
import type { WizardStepButtons } from '@drizztdourden08/tessera/composites';
import type { SelectOption } from '@drizztdourden08/tessera/primitives';
import type { RomLanguage } from '@rotp/asset-extraction';
import type { LanguageSource, LanguageWizardValues } from './LanguageCreateWizard.type';

const STEP_IDS = {
  source: 'source',
  details: 'details',
  extract: 'extract',
  import: 'import',
  create: 'create',
} as const;

const STEP_LABELS = {
  source: 'Source',
  details: 'Details',
  extract: 'Extract',
  import: 'Import',
  create: 'Create',
} as const;

const WIZARD_TITLE = 'New language';

const SOURCE_LABELS: Readonly<Record<LanguageSource, string>> = {
  rom: 'Official ROM',
  patched: 'Fan-patched ROM',
  copy: 'Copy of a set',
  blank: 'New set from a base',
};

const SOURCE_DESCRIPTIONS: Readonly<Record<LanguageSource, string>> = {
  rom: 'Read the language of an official release from its ROM file or a download link.',
  patched: 'Read a fan translation from a ROM patched over an official release.',
  copy: 'A full copy of one of your sets, glossary and names included.',
  blank: 'Starts from the text of one of your sets, with no glossary or names of its own.',
};

const SOURCE_ORDER: readonly LanguageSource[] = ['rom', 'patched', 'copy', 'blank'];

const NO_OWN_SET_REASON = 'You have no set of your own to start from yet.';

const DEFAULT_RELEASE: RomLanguage = 'us';

const RELEASE_OPTIONS: readonly SelectOption[] = [
  { value: 'us', label: 'US English' },
  { value: 'de', label: 'German' },
  { value: 'fr', label: 'French' },
  { value: 'fr-c', label: 'French Canadian' },
  { value: 'en', label: 'European English' },
  { value: 'es', label: 'Spanish' },
  { value: 'pl', label: 'Polish' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'nl', label: 'Dutch' },
  { value: 'sv', label: 'Swedish' },
  { value: 'redux', label: 'Redux' },
];

const PATCHED_ROM_ACCEPT = ['.sfc', '.smc', '.zip'];

const BUSY_HINTS = {
  extract: 'Extracting the language',
  import: 'Importing the patched ROM',
  create: 'Creating the set',
} as const;

const EXTRACT_BUTTONS: WizardStepButtons = { next: { label: 'Extract language' } };

const CREATE_BUTTONS: WizardStepButtons = { next: { label: 'Create set' } };

const IMPORT_BUTTONS: WizardStepButtons = { next: { label: 'Done' } };

const IMPORTED_BUTTONS: WizardStepButtons = { cancel: false, back: false, next: { label: 'Done' } };

const PROBLEMS = {
  noRom: 'Drop a ROM file or paste its download link.',
  badUrl: 'The download link is not a web address.',
  noName: 'Type a name for the language.',
  noPatchedRom: 'Drop the patched ROM.',
  noBase: 'Pick the set to start from.',
  notImported: 'Run the import first.',
} as const;

const IMPORTED_MESSAGE = 'The language is saved. Check the report, then press Done to open it.';

const INITIAL_VALUES: LanguageWizardValues = {
  source: 'rom',
  romFile: null,
  romUrl: '',
  patchedFile: null,
  name: '',
  release: DEFAULT_RELEASE,
  credits: '',
  baseSet: '',
};

export {
  BUSY_HINTS, CREATE_BUTTONS, EXTRACT_BUTTONS, IMPORTED_BUTTONS, IMPORTED_MESSAGE, IMPORT_BUTTONS, INITIAL_VALUES,
  NO_OWN_SET_REASON, PATCHED_ROM_ACCEPT, PROBLEMS, RELEASE_OPTIONS, SOURCE_DESCRIPTIONS, SOURCE_LABELS, SOURCE_ORDER,
  STEP_IDS, STEP_LABELS, WIZARD_TITLE,
};
