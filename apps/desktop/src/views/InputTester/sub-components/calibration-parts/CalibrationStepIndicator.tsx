/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Stepper } from '@drizztdourden08/tessera/primitives';
import type { CalibrationStepIndicatorProps } from './calibration-parts.type';

const CalibrationStepIndicator = <K extends string,>(props: CalibrationStepIndicatorProps<K>) => {
  const { steps, current } = props;
  const stepperSteps = useMemo(() => steps.map((s) => ({ id: s.key, label: s.label })), [steps]);
  return <Stepper steps={stepperSteps} currentId={current} label="Calibration steps" />;
};

export { CalibrationStepIndicator };
