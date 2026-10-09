/* @layer renderer-components @kind logic */
import type { DiagnosticsWizardState } from '../../diagnostics-wizard/behavior/useDiagnosticsWizardState';

const buildReportStepLabels = (wizard: DiagnosticsWizardState): readonly string[] =>
  ['About', 'Your info', ...wizard.stepLabels, 'Review'];

export { buildReportStepLabels };
