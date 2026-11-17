/* @layer renderer-components @kind logic */
import type { WizardStepDef } from '@drizztdourden08/tessera/composites';

type StepExtras<V> = Omit<WizardStepDef<V>, 'id' | 'label'>;

const stepBuilder = <V, K extends string>(ids: Record<K, string>, labels: Record<K, string>) =>
  (key: K, extras: StepExtras<V> = {} as StepExtras<V>): WizardStepDef<V> => ({ id: ids[key], label: labels[key], ...extras });

export { stepBuilder };
