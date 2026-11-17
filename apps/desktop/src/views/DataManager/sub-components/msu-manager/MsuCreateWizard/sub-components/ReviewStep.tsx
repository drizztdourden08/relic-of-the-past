/* @layer renderer-components @kind component */
import { Stack } from '@drizztdourden08/tessera/primitives';
import { WizardReview } from '@drizztdourden08/tessera/composites';
import { ImportProgress } from '../../../ImportProgress';
import { reviewSections } from '../behavior/review-rows';
import type { ReviewStepProps } from '../MsuCreateWizard.type';

const ReviewStep = ({ wizard, progress }: ReviewStepProps) => (
  <Stack gap="md">
    <WizardReview
      sections={reviewSections(wizard.values)}
      disabled={wizard.busy}
      onEdit={(stepId) => wizard.goTo(stepId)}
    />
    {wizard.busy && progress.active && <ImportProgress state={progress} />}
  </Stack>
);

export { ReviewStep };
