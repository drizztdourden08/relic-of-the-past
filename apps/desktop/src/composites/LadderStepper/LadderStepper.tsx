/* @layer renderer-components @kind component */
import { Box, SegmentedControl, Stepper, Tag, Text } from '@drizztdourden08/tessera/primitives';
import { stepsOf } from './behavior/steps-of';
import type { LadderStepperProps } from './LadderStepper.type';
import './LadderStepper.css';

const LadderStepper = (props: LadderStepperProps) => {
  const { ladder, modeOptions, modeLabel, disabled, readout = false, onRungChange, onModeChange } = props;
  const { name, countText, rungs, noneOn, mode } = ladder;
  const editable = !readout && !disabled && onRungChange !== undefined;

  const toggle = (key: string): void => {
    const rung = rungs.find((candidate) => candidate.key === key);
    if (rung !== undefined) onRungChange?.(rung.index, !rung.checked);
  };

  return (
    <Box surface="sunken" className="ladder-stepper" data-empty={noneOn ? '' : undefined}>
      <Box className="ladder-stepper__head">
        <Box className="ladder-stepper__heading">
          <Text className="ladder-stepper__title">{name}</Text>
          <Text className="ladder-stepper__count">{countText}</Text>
        </Box>
        {readout ? <Tag>{modeLabel}</Tag> : (
          <SegmentedControl
            className="ladder-stepper__mode"
            size="sm"
            value={mode}
            options={[...modeOptions]}
            disabled={disabled || noneOn || onModeChange === undefined}
            onChange={(next) => onModeChange?.(next)}
          />
        )}
      </Box>
      <Stepper
        label={name}
        steps={stepsOf(rungs)}
        selectMode="toggle"
        labelPlacement="above"
        dotVariant="ring"
        tone="primary"
        reserve="none"
        stepWidth="sm"
        mediaSize="md"
        scroll
        canSelect={() => editable}
        onSelect={toggle}
      />
    </Box>
  );
};

export { LadderStepper };
