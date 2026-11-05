/* @layer renderer-components @kind component */
import { WizardReview } from '@drizztdourden08/tessera/composites';
import { reviewSections } from '../../behavior/review-sections';
import type { ReviewStepProps } from './ReviewStep.type';

const ReviewStep = ({ wizard }: ReviewStepProps) => (
  <WizardReview
    sections={reviewSections(wizard.values)}
    disabled={wizard.busy}
    onEdit={(stepId) => wizard.goTo(stepId)}
  />
);

export { ReviewStep };
