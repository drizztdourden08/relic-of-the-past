/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { ReviewPanel } from '../../../../ReviewPanel';
import { reviewSections } from '../../behavior/review-sections';
import type { ReviewStepProps } from './ReviewStep.type';

const ReviewStep = ({ wizard, sets, progress }: ReviewStepProps) => {
  const t = useT();
  return <ReviewPanel sections={reviewSections(wizard.values, sets, t)} wizard={wizard} progress={progress} />;
};

export { ReviewStep };
