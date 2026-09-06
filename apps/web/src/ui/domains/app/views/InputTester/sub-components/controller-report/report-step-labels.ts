/* @layer renderer-components @kind logic */
/**
 * Merges the report's steps with the wizard's dynamic step list into one strip. The diagnostic
 * labels come from the wizard (byte-capture drops out without byte capability), never restated here.
 */
import type { DiagnosticsWizardState } from '../diagnostics-wizard/behavior/useDiagnosticsWizardState';

type ReportStep = 'about' | 'user-info' | 'diagnostics' | 'confirm';

const buildReportStepLabels = (wizard: DiagnosticsWizardState): readonly string[] =>
  ['About', 'Your info', ...wizard.stepLabels, 'Review'];

const reportStepIndex = (step: ReportStep, wizard: DiagnosticsWizardState): number => {
  if (step === 'about') return 0;
  if (step === 'user-info') return 1;
  if (step === 'diagnostics') return 2 + wizard.stepIndex;
  return 2 + wizard.stepLabels.length;
};

export { buildReportStepLabels, reportStepIndex };
export type { ReportStep };
