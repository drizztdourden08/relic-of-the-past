/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { ReviewPanel } from '../../../ReviewPanel';
import { reviewSections } from '../behavior/review-rows';
import type { ReviewStepProps } from '../MsuCreateWizard.type';

const ReviewStep = ({ wizard, progress }: ReviewStepProps) => {
  const t = useT();
  return <ReviewPanel sections={reviewSections(wizard.values, t)} wizard={wizard} progress={progress} />;
};

export { ReviewStep };
