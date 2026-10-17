/* @layer renderer-components @kind component */
import { Box, SegmentedControl, Text } from '@drizztdourden08/tessera/primitives';
import { PROGRESSIVE_MODE_LABELS } from '@rotp/randomizer';
import type { ProgressiveFamilyMode } from '@rotp/randomizer';
import { OptionValueTag } from '../OptionValueTag';
import { LadderRung } from './sub-components/LadderRung';
import { MODE_OPTIONS } from './ProgressiveLadder.constants';
import type { ProgressiveLadderProps } from './ProgressiveLadder.type';
import './ProgressiveLadder.css';

const ProgressiveLadder = (props: ProgressiveLadderProps) => {
  const { ladder, disabled, readout = false, onRungChange, onModeChange } = props;
  const { name, countText, rungs, noneOn, mode } = ladder;

  return (
    <Box
      surface="sunken"
      className="progressive-ladder"
      data-empty={noneOn ? '' : undefined}
    >
      <Box className="progressive-ladder__head">
        <Box className="progressive-ladder__heading">
          <Text className="progressive-ladder__title">{name}</Text>
          <Text className="progressive-ladder__count">{countText}</Text>
        </Box>
        {readout ? <OptionValueTag value={PROGRESSIVE_MODE_LABELS[mode]} /> : (
          <SegmentedControl<ProgressiveFamilyMode>
            className="progressive-ladder__mode"
            size="sm"
            value={mode}
            options={MODE_OPTIONS}
            disabled={disabled || noneOn || onModeChange === undefined}
            onChange={(next) => onModeChange?.(next)}
          />
        )}
      </Box>
      <Box className="progressive-ladder__rungs">
        {rungs.map((rung) => (
          <LadderRung
            key={rung.key}
            rung={rung}
            ordered={mode === 'progressive'}
            disabled={disabled}
            readout={readout}
            onChange={onRungChange}
          />
        ))}
      </Box>
    </Box>
  );
};

export { ProgressiveLadder };
