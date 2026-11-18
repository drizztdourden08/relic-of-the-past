/* @layer renderer-components @kind constants */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { WizardStepButtons } from '@drizztdourden08/tessera/composites';
import type { RadioOption } from '@drizztdourden08/tessera/primitives';
import type { MsuSource, MsuWizardValues } from './MsuCreateWizard.type';

const STEP_IDS = { source: 'source', details: 'details', create: 'create' } as const;

const stepLabels = (t: I18n['t']) => ({
  source: t('wizards:msu.steps.source'),
  details: t('wizards:msu.steps.details'),
  create: t('wizards:msu.steps.create'),
}) as const;

const sourceLabels = (t: I18n['t']): Readonly<Record<MsuSource, string>> => ({
  empty: t('wizards:msu.source.empty'),
  file: t('wizards:msu.source.file'),
  url: t('wizards:msu.source.url'),
});

const sourceOptions = (t: I18n['t']): readonly RadioOption<MsuSource>[] => [
  { value: 'empty', label: sourceLabels(t).empty, description: t('wizards:msu.source.empty-description') },
  { value: 'file', label: sourceLabels(t).file, description: t('wizards:msu.source.file-description') },
  { value: 'url', label: sourceLabels(t).url, description: t('wizards:msu.source.url-description') },
];

const MSU_PACK_ACCEPT = ['.msul', '.zip', '.7z', '.rar'];

const problems = (t: I18n['t']) => ({
  noName: t('wizards:msu.problem.no-name'),
  taken: t('wizards:msu.problem.taken'),
  noFile: t('wizards:msu.problem.no-file'),
  noUrl: t('wizards:msu.problem.no-url'),
  badUrl: t('wizards:msu.problem.bad-url'),
}) as const;

const createButtons = (t: I18n['t']): WizardStepButtons => ({ next: { label: t('wizards:msu.buttons.create') } });

const INITIAL_VALUES: MsuWizardValues = { source: 'empty', name: '', file: null, url: '' };

export {
  createButtons, INITIAL_VALUES, MSU_PACK_ACCEPT, problems, sourceLabels, sourceOptions, STEP_IDS, stepLabels,
};
