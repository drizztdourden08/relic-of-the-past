/* @layer renderer-components @kind component */
/**
 * The Custom-mode price controls of the pond: the first-to-final price range
 * on the pond's own ladder (its stops end where the wallet's reach ends, so
 * the top thumb can never ask for more than the wallet holds), how many
 * throws it sells, the curve that cuts the climb between them, and the
 * free-sequence chips when the curve is "free": the same four controls a
 * capacity family offers, over prices instead of capacities.
 */
import { Box, RangeSlider, Select, Slider, Text } from '@ds/primitives';
import { JumpChipsEditor } from '../../JumpChipsEditor';
import type { SelectOption } from '@ds/primitives';
import type { PondRowModel, PondRowState } from '../WishingPondRow.type';

interface PondPriceControlsProps {
  model: PondRowModel;
  readOnly: boolean;
  onChange: (part: Partial<PondRowState>) => void;
}

const throwsLabel = (count: number): string => `${count} throw${count === 1 ? '' : 's'}`;

const PondPriceControls = (props: PondPriceControlsProps) => {
  const { model, readOnly, onChange } = props;
  const { stops, state, curveOptions, maxThrows, label } = model;
  const [low, high] = state.range;
  const span = high - low;

  return (
    <>
      <Box className="pond-row__range">
        <Box className="pond-row__range-head">
          <Text className="pond-row__caption">first throw to final throw</Text>
          <Text className="pond-row__readout">{`${stops[low]} to ${stops[high]}`}</Text>
        </Box>
        <RangeSlider
          stops={stops}
          value={state.range}
          labelEvery={3}
          disabled={readOnly}
          ariaLabel={label}
          onChange={(range) => onChange({ range })}
        />
      </Box>
      <Box className="pond-row__controls">
        <Box className="pond-row__throws">
          <Text className="pond-row__caption">throws the pond sells</Text>
          <Slider
            value={Math.min(Math.max(state.throws, 1), maxThrows)}
            min={1}
            max={maxThrows}
            step={1}
            disabled={readOnly}
            formatValue={throwsLabel}
            onChange={(throws) => onChange({ throws })}
          />
        </Box>
        <Box className="pond-row__curve">
          <Text className="pond-row__caption">price curve</Text>
          <Select
            size="sm"
            value={state.curve}
            options={curveOptions as SelectOption[]}
            disabled={readOnly}
            onChange={(curve) => onChange({ curve: curve as PondRowState['curve'] })}
          />
        </Box>
      </Box>
      {state.curve === 'free' && (
        <Box className="pond-row__jumps">
          <Text className="pond-row__caption">price steps</Text>
          <JumpChipsEditor
            jumps={state.jumps}
            span={span}
            disabled={readOnly}
            onChange={(jumps) => onChange({ jumps })}
          />
        </Box>
      )}
    </>
  );
};

export { PondPriceControls };
export type { PondPriceControlsProps };
