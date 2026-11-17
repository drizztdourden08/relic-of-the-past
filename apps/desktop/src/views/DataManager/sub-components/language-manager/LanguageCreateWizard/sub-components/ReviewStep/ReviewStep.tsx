/* @layer renderer-components @kind component */
import { Stack } from '@drizztdourden08/tessera/primitives';
import { WizardReview } from '@drizztdourden08/tessera/composites';
import { ImportProgress } from '../../../../ImportProgress';
import { reviewSections } from '../../behavior/review-sections';
import type { ReviewStepProps } from './ReviewStep.type';

const ReviewStep = ({ wizard, sets, progress }: ReviewStepProps) => (
  <Stack gap="md">
    <WizardReview
      sections={reviewSections(wizard.values, sets)}
      disabled={wizard.busy}
      onEdit={(stepId) => wizard.goTo(stepId)}
    />
    {wizard.busy && progress.active && <ImportProgress state={progress} />}
  </Stack>
);

export { ReviewStep };
