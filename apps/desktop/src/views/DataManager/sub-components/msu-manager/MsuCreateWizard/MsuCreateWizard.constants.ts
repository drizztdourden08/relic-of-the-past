/* @layer renderer-components @kind constants */
import type { WizardStepButtons } from '@drizztdourden08/tessera/composites';
import type { RadioOption } from '@drizztdourden08/tessera/primitives';
import type { MsuSource, MsuWizardValues } from './MsuCreateWizard.type';

const STEP_IDS = { source: 'source', details: 'details', create: 'create' } as const;

const STEP_LABELS = { source: 'Source', details: 'Details', create: 'Create' } as const;

const WIZARD_TITLE = 'New MSU pack';

const SOURCE_LABELS: Readonly<Record<MsuSource, string>> = {
  empty: 'Empty pack',
  file: 'Pack file',
  url: 'Download link',
};

const SOURCE_OPTIONS: readonly RadioOption<MsuSource>[] = [
  { value: 'empty', label: SOURCE_LABELS.empty, description: 'A pack with no music yet, ready for tracks to be assigned.' },
  { value: 'file', label: SOURCE_LABELS.file, description: 'A .msul file, or a .zip / .7z / .rar archive of audio.' },
  { value: 'url', label: SOURCE_LABELS.url, description: 'Download a pack from a web address.' },
];

const MSU_PACK_ACCEPT = ['.msul', '.zip', '.7z', '.rar'];

const NAME_HINT = 'Names the new pack.';

const PROBLEMS = {
  noName: 'Type a name for the pack.',
  taken: 'A pack with that name already exists. Pick another.',
  noFile: 'Drop a pack file.',
  noUrl: 'Paste the pack download link.',
  badUrl: 'The download link is not a web address.',
} as const;

const BUSY_HINT = 'Creating the pack';

const CREATE_BUTTONS: WizardStepButtons = { next: { label: 'Create pack' } };

const INITIAL_VALUES: MsuWizardValues = { source: 'empty', name: '', file: null, url: '' };

export {
  BUSY_HINT, CREATE_BUTTONS, INITIAL_VALUES, MSU_PACK_ACCEPT, NAME_HINT, PROBLEMS, SOURCE_LABELS, SOURCE_OPTIONS, STEP_IDS,
  STEP_LABELS, WIZARD_TITLE,
};
