/* @layer renderer-components @kind logic */
import { ALL_STEPS } from '../diagnostics-wizard.constants';
import type { WizardStep, WizardStepInfo } from '../diagnostics-wizard.type';

const visibleSteps = (hasByteCapability: boolean): readonly WizardStepInfo[] =>
  hasByteCapability ? ALL_STEPS : ALL_STEPS.filter((s) => s.step !== 'byte-capture');

export { visibleSteps };
export type { WizardStep, WizardStepInfo };
