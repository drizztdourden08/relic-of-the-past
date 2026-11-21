/* @layer renderer-components @kind logic */
import type { WizardStepDef } from '@drizztdourden08/tessera/composites';
import type { StepExtras } from './wizard-step.type';

const stepBuilder = <V extends object, K extends string>(ids: Record<K, string>, labels: Record<K, string>) =>
  (key: K, extras: StepExtras<V> = {}): WizardStepDef<V> => ({ id: ids[key], label: labels[key], ...extras });

export { stepBuilder };
