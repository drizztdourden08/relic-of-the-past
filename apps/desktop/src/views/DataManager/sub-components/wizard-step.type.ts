/* @layer renderer-components @kind types */
import type { WizardStepDef } from '@drizztdourden08/tessera/composites';

type StepExtras<V extends object> = Omit<WizardStepDef<V>, 'id' | 'label'>;

export type { StepExtras };
