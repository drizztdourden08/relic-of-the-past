/* @layer renderer-components @kind component */
import { Stack } from '@drizztdourden08/tessera/primitives';
import { WizardReview } from '@drizztdourden08/tessera/composites';
import { ImportProgress } from './ImportProgress';
import type { ReviewPanelProps } from './ReviewPanel.type';

const ReviewPanel = ({ sections, wizard, progress }: ReviewPanelProps) => (
  <Stack gap="md">
    <WizardReview sections={sections} disabled={wizard.busy} onEdit={wizard.goTo} />
    {wizard.busy && progress.active && <ImportProgress state={progress} />}
  </Stack>
);

export { ReviewPanel };
