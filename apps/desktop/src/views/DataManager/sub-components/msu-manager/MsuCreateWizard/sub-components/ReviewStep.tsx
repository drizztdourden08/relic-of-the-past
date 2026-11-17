/* @layer renderer-components @kind component */
import { ReviewPanel } from '../../../ReviewPanel';
import { reviewSections } from '../behavior/review-rows';
import type { ReviewStepProps } from '../MsuCreateWizard.type';

const ReviewStep = ({ wizard, progress }: ReviewStepProps) => (
  <ReviewPanel sections={reviewSections(wizard.values)} wizard={wizard} progress={progress} />
);

export { ReviewStep };
