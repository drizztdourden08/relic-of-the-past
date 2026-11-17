/* @layer renderer-components @kind component */
import { ReviewPanel } from '../../../../ReviewPanel';
import { reviewSections } from '../../behavior/review-sections';
import type { ReviewStepProps } from './ReviewStep.type';

const ReviewStep = ({ wizard, sets, progress }: ReviewStepProps) => (
  <ReviewPanel sections={reviewSections(wizard.values, sets)} wizard={wizard} progress={progress} />
);

export { ReviewStep };
