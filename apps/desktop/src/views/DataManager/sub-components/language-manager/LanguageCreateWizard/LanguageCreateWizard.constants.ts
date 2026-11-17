/* @layer renderer-components @kind constants */
import type { WizardStepButtons } from '@drizztdourden08/tessera/composites';
import { OFFICIAL_RELEASES, ZELDA3_SHA1 } from '@rotp/asset-extraction';
import type { RomLanguage } from '@rotp/asset-extraction';
import type { LanguageSource, LanguageWizardValues, ReleaseItem, TextOrFile } from './LanguageCreateWizard.type';

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

const RELEASE_NAMES: Readonly<Record<string, string>> = {
  us: 'US English',
  de: 'German',
  fr: 'French',
  'fr-c': 'French Canadian',
  en: 'European English',
};

const releaseItem = (code: RomLanguage): ReleaseItem => {
  const sha1 = Object.keys(ZELDA3_SHA1).find((hash) => ZELDA3_SHA1[hash]?.language === code) ?? '';
  return { value: code, release: RELEASE_NAMES[code] ?? code, sha1 };
};

const RELEASE_ITEMS: readonly ReleaseItem[] = OFFICIAL_RELEASES.map(releaseItem);

const EMPTY_TEXT_OR_FILE: TextOrFile = { mode: 'text', text: '', fileName: '' };

const TEXT_OR_FILE_OPTIONS = [
  { value: 'text', label: 'Text' },
  { value: 'file', label: 'File' },
] as const;

const LICENSE_ACCEPT = ['.txt', '.md', '.license'];

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
  credits: EMPTY_TEXT_OR_FILE,
  license: EMPTY_TEXT_OR_FILE,
  baseSet: '',
};

export {
  BUSY_HINTS, CREATE_BUTTONS, EMPTY_TEXT_OR_FILE, EXTRACT_BUTTONS, IMPORTED_BUTTONS, IMPORTED_MESSAGE, IMPORT_BUTTONS, INITIAL_VALUES,
  LICENSE_ACCEPT, NO_OWN_SET_REASON, PATCHED_ROM_ACCEPT, PROBLEMS, RELEASE_ITEMS, SOURCE_DESCRIPTIONS, SOURCE_LABELS,
  SOURCE_ORDER, STEP_IDS, STEP_LABELS, TEXT_OR_FILE_OPTIONS, WIZARD_TITLE,
};
