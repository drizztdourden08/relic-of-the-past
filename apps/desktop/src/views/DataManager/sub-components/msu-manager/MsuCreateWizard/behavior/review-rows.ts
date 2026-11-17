/* @layer renderer-components @kind logic */
import type { FactsPanelFact, WizardReviewSection } from '@drizztdourden08/tessera/composites';
import { SOURCE_LABELS, STEP_IDS, STEP_LABELS } from '../MsuCreateWizard.constants';
import type { MsuWizardValues } from '../MsuCreateWizard.type';

const originRows = (values: MsuWizardValues): FactsPanelFact[] => {
  if (values.source === 'file') return [{ label: 'File', value: values.file?.name ?? '' }];
  if (values.source === 'url') return [{ label: 'Link', value: values.url.trim() }];
  return [];
};

const reviewSections = (values: MsuWizardValues): WizardReviewSection[] => [
  {
    stepId: STEP_IDS.details,
    title: STEP_LABELS.details,
    rows: [
      { label: 'Source', value: SOURCE_LABELS[values.source] },
      { label: 'Name', value: values.name.trim() },
      ...originRows(values),
    ],
  },
];

export { reviewSections };
