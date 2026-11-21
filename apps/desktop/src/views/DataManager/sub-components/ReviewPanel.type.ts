/* @layer renderer-components @kind types */
import type { WizardReviewSection } from '@drizztdourden08/tessera/composites';
import type { ImportProgressState } from '@app/hooks/useImportProgress';

interface ReviewPanelProps {
  sections: WizardReviewSection[];
  wizard: { busy: boolean; goTo: (stepId: string) => void };
  progress: ImportProgressState;
}

export type { ReviewPanelProps };
