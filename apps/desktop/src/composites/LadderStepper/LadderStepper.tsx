/* @layer renderer-components @kind component */
import { Box, SegmentedControl, Stepper, Tag, Text } from '@drizztdourden08/tessera/primitives';
import { spriteVarsOf } from './behavior/sprite-vars-of';
import { stepsOf } from './behavior/steps-of';
import type { LadderStepperProps } from './LadderStepper.type';
import './LadderStepper.css';

const LadderStepper = (props: LadderStepperProps) => {
  const { ladder, modeOptions, modeLabel, ordered, disabled, readout = false, onRungChange, onModeChange } = props;
  const { name, countText, rungs, noneOn, mode } = ladder;
  const editable = !readout && !disabled && onRungChange !== undefined;

  const toggle = (key: string): void => {
    const rung = rungs.find((candidate) => candidate.key === key);
    if (rung !== undefined) onRungChange?.(rung.index, !rung.checked);
  };

  return (
    <Box surface="sunken" className="ladder-stepper" data-empty={noneOn ? '' : undefined} data-ordered={ordered ? '' : undefined}>
      <Box className="ladder-stepper__head">
        <Box className="ladder-stepper__heading">
          <Text className="ladder-stepper__title">{name}</Text>
          <Text className="ladder-stepper__count">{countText}</Text>
        </Box>
        {readout ? <Tag>{modeLabel}</Tag> : (
          <SegmentedControl<string>
            className="ladder-stepper__mode"
            size="sm"
            value={mode}
            options={[...modeOptions]}
            disabled={disabled || noneOn || onModeChange === undefined}
            onChange={(next) => onModeChange?.(next)}
          />
        )}
      </Box>
      <Box className="ladder-stepper__scroll" style={spriteVarsOf(rungs)}>
        <Stepper
          className="ladder-stepper__rungs"
          label={name}
          steps={stepsOf(rungs)}
          currentId=""
          complete
          doneIcon={false}
          reserve="none"
          canSelect={() => editable}
          onSelect={toggle}
        />
      </Box>
    </Box>
  );
};

export { LadderStepper };
