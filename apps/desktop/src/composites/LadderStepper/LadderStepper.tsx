/* @layer renderer-components @kind component */
import { Box, Stepper } from '@drizztdourden08/tessera/primitives';
import { classesOf } from './behavior/ladder-classes';
import { stepsOf } from './behavior/steps-of';
import { LadderMediaRow } from './sub-components/LadderMediaRow';
import type { LadderStepperProps } from './LadderStepper.type';
import './LadderStepper.css';

const LadderStepper = (props: LadderStepperProps) => {
  const { label, steps, size = 'default', mediaPlacement = 'above', showLabels = true, className = '' } = props;
  const below = mediaPlacement === 'below';
  const mods = size === 'compact' ? ['ladder-stepper--compact'] : [];

  const toggle = (key: string): void => steps.find((step) => step.key === key)?.onToggle?.();

  const stepper = (
    <Stepper
      className={below ? classesOf('ladder-stepper__rail', ...mods) : classesOf('ladder-stepper', ...mods, className)}
      label={label}
      steps={stepsOf(steps, { withMedia: !below, withLabels: showLabels })}
      selectMode="toggle"
      labelPlacement={showLabels ? 'above' : 'below'}
      dotVariant="ring"
      tone="primary"
      reserve="none"
      stepWidth={size === 'compact' ? undefined : 'sm'}
      mediaSize="md"
      scroll={!below}
      canSelect={(key) => steps.find((step) => step.key === key)?.onToggle !== undefined}
      onSelect={toggle}
    />
  );

  if (!below) return stepper;

  return (
    <Box className={classesOf('ladder-stepper', 'ladder-stepper--below', ...mods, className)}>
      {stepper}
      <LadderMediaRow steps={steps} />
    </Box>
  );
};

export { LadderStepper };
