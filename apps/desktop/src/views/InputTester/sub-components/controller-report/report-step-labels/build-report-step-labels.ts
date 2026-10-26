/* @layer renderer-components @kind logic */
import type { DiagnosticsWizardState } from '@drizztdourden08/brock-input/renderer';

const buildReportStepLabels = (wizard: DiagnosticsWizardState): readonly string[] =>
  ['About', 'Your info', ...wizard.stepLabels, 'Review'];

export { buildReportStepLabels };
