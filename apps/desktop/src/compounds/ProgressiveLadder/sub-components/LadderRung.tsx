/* @layer renderer-components @kind component */
import { Box, Checkbox, Image, Text } from '@drizztdourden08/tessera/primitives';
import { IN_SEED, OUT_OF_SEED } from '../ProgressiveLadder.constants';
import type { LadderRungProps } from './LadderRung.type';
import './LadderRung.css';

const placeholderArt = <Box className="ladder-rung__sprite ladder-rung__sprite--placeholder" />;

const LadderRung = (props: LadderRungProps) => {
  const { rung, ordered, disabled, readout, onChange } = props;
  const { label, index, checked, sprite } = rung;
  const art = sprite === undefined ? placeholderArt : (
    <Image className="ladder-rung__sprite" src={sprite} alt="" draggable={false} fallback={placeholderArt} />
  );
  const face = (
    <Box as="span" className="ladder-rung__face">
      <Box as="span" className="ladder-rung__tile">{art}</Box>
      <Text as="span" className="ladder-rung__name">{label}</Text>
    </Box>
  );

  return (
    <Box
      className="ladder-rung"
      data-checked={checked ? '' : undefined}
      data-unordered={ordered ? undefined : ''}
      title={`${label}: ${checked ? IN_SEED : OUT_OF_SEED}`}
    >
      {readout ? face : (
        <Checkbox
          className="ladder-rung__control"
          label={face}
          labelSize="sm"
          checked={checked}
          disabled={disabled || onChange === undefined}
          onChange={(next) => onChange?.(index, next)}
        />
      )}
    </Box>
  );
};

export { LadderRung };
