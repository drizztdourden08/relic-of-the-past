/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { DiagnosticsWizardState } from '@drizztdourden08/brock-input/renderer';

const buildReportStepLabels = (wizard: DiagnosticsWizardState, t: I18n['t']): readonly string[] =>
  [t('views-input-tester:step.about'), t('views-input-tester:step.userInfo'), ...wizard.stepLabels, t('views-input-tester:step.review')];

export { buildReportStepLabels };
