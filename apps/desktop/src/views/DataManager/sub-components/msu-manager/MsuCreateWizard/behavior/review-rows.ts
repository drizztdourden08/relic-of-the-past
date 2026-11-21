/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { FactsPanelFact, WizardReviewSection } from '@drizztdourden08/tessera/composites';
import { sourceLabels, STEP_IDS, stepLabels } from '../MsuCreateWizard.constants';
import type { MsuWizardValues } from '../MsuCreateWizard.type';

const originRows = (values: MsuWizardValues, t: I18n['t']): FactsPanelFact[] => {
  if (values.source === 'file') return [{ label: t('wizards:msu.review.file'), value: values.file?.name ?? '' }];
  if (values.source === 'url') return [{ label: t('wizards:msu.review.link'), value: values.url.trim() }];
  return [];
};

const reviewSections = (values: MsuWizardValues, t: I18n['t']): WizardReviewSection[] => [
  {
    stepId: STEP_IDS.details,
    title: stepLabels(t).details,
    rows: [
      { label: t('wizards:msu.review.source'), value: sourceLabels(t)[values.source] },
      { label: t('wizards:msu.review.name'), value: values.name.trim() },
      ...originRows(values, t),
    ],
  },
];

export { reviewSections };
