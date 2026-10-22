/* @layer renderer-components @kind component */
import { Stepper } from '@drizztdourden08/tessera/primitives';
import { stepsOf } from './behavior/steps-of';
import type { LadderStepperProps } from './LadderStepper.type';
import './LadderStepper.css';

const LadderStepper = (props: LadderStepperProps) => {
  const { label, steps, className = '' } = props;

  const toggle = (key: string): void => steps.find((step) => step.key === key)?.onToggle?.();

  return (
    <Stepper
      className={`ladder-stepper${className ? ` ${className}` : ''}`}
      label={label}
      steps={stepsOf(steps)}
      selectMode="toggle"
      labelPlacement="above"
      dotVariant="ring"
      tone="primary"
      reserve="none"
      stepWidth="sm"
      mediaSize="md"
      scroll
      canSelect={(key) => steps.find((step) => step.key === key)?.onToggle !== undefined}
      onSelect={toggle}
    />
  );
};

export { LadderStepper };
