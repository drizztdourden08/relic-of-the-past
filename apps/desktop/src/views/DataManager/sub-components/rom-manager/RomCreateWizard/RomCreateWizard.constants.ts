/* @layer renderer-components @kind constants */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { WizardStepButtons } from '@drizztdourden08/tessera/composites';
import type { RomWizardValues } from './RomCreateWizard.type';

const STEP_IDS = {
  kind: 'kind',
  file: 'file',
  import: 'import',
} as const;

const stepLabels = (t: I18n['t']) => ({
  kind: t('wizards:rom.steps.kind'),
  file: t('wizards:rom.steps.file'),
  import: t('wizards:rom.steps.import'),
}) as const;

const importButtons = (t: I18n['t']): WizardStepButtons => ({ next: { label: t('wizards:rom.buttons.import') } });

const problems = (t: I18n['t']) => ({
  noFile: t('wizards:rom.problem.no-file'),
  badUrl: t('wizards:rom.problem.bad-url'),
}) as const;

const INITIAL_VALUES: RomWizardValues = { kind: 'snes-alttp', file: null, check: null, url: '' };

export { importButtons, INITIAL_VALUES, problems, STEP_IDS, stepLabels };
