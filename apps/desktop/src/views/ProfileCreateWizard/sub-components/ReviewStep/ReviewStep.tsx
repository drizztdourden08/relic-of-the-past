/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { WizardReview } from '@drizztdourden08/tessera/composites';
import { reviewSections } from '../../behavior/review-sections';
import type { ReviewStepProps } from './ReviewStep.type';

const ReviewStep = ({ wizard, languages }: ReviewStepProps) => {
  const t = useT();
  return (
    <WizardReview
      sections={reviewSections(wizard.values, languages, t)}
      disabled={wizard.busy}
      onEdit={(stepId) => wizard.goTo(stepId)}
    />
  );
};

export { ReviewStep };
