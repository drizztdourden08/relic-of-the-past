/* @layer renderer-components @kind component */
import { Stepper } from '@drizztdourden08/tessera/primitives';
import { classesOf } from './behavior/ladder-classes';
import { stepsOf } from './behavior/steps-of';
import type { LadderStepperProps } from './LadderStepper.type';
import './LadderStepper.css';

const LadderStepper = (props: LadderStepperProps) => {
  const { label, steps, size = 'default', mediaPlacement = 'above', showLabels = true, className = '' } = props;
  const compact = size === 'compact';

  const toggle = (key: string): void => steps.find((step) => step.key === key)?.onToggle?.();

  return (
    <Stepper
      className={classesOf('ladder-stepper', compact && 'ladder-stepper--compact', className)}
      label={label}
      steps={stepsOf(steps)}
      selectMode="toggle"
      labelPlacement={showLabels ? 'above' : 'hidden'}
      mediaPlacement={mediaPlacement}
      size={compact ? 'sm' : 'md'}
      dotVariant="ring"
      tone="primary"
      reserve="none"
      stepWidth={compact ? undefined : 'sm'}
      mediaSize="md"
      scroll
      canSelect={(key) => steps.find((step) => step.key === key)?.onToggle !== undefined}
      onSelect={toggle}
    />
  );
};

export { LadderStepper };
