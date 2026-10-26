/* @layer renderer-components @kind logic */
import type { DiagnosticsWizardState } from '@drizztdourden08/brock-input/renderer';
import { LEAD_STEP_COUNT } from '../controller-report.constants';
import type { ReportStep } from '@drizztdourden08/brock-input/renderer';

const reportStepIndex = (step: ReportStep, wizard: DiagnosticsWizardState): number => {
  if (step === 'about') return 0;
  if (step === 'user-info') return 1;
  if (step === 'diagnostics') return LEAD_STEP_COUNT + wizard.stepIndex;
  return LEAD_STEP_COUNT + wizard.stepLabels.length;
};

export { reportStepIndex };
