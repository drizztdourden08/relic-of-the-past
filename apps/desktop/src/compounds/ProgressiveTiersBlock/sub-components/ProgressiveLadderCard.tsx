/* @layer renderer-components @kind component */
import { Box, SegmentedControl, Tag, Text } from '@drizztdourden08/tessera/primitives';
import { LadderStepper } from '@app/composites/LadderStepper';
import { stepsOfLadder } from '../behavior/steps-of-ladder';
import type { ProgressiveLadderCardProps } from './ProgressiveLadderCard.type';
import './ProgressiveLadderCard.css';

const ProgressiveLadderCard = (props: ProgressiveLadderCardProps) => {
  const { ladder, modeOptions, modeLabel, disabled, readout = false, onRungChange, onModeChange } = props;
  const { name, countText, noneOn, mode } = ladder;
  const editable = !readout && !disabled && onRungChange !== undefined;

  return (
    <Box surface="sunken" className="ladder-card" data-empty={noneOn ? '' : undefined}>
      <Box className="ladder-card__head">
        <Box className="ladder-card__heading">
          <Text className="ladder-card__title">{name}</Text>
          <Text className="ladder-card__count">{countText}</Text>
        </Box>
        {readout ? <Tag>{modeLabel}</Tag> : (
          <SegmentedControl
            className="ladder-card__mode"
            size="sm"
            value={mode}
            options={[...modeOptions]}
            disabled={disabled || noneOn || onModeChange === undefined}
            onChange={(next) => onModeChange?.(next)}
          />
        )}
      </Box>
      <LadderStepper label={name} steps={stepsOfLadder(ladder, editable ? onRungChange : undefined)} />
    </Box>
  );
};

export { ProgressiveLadderCard };
