/* @layer renderer-components @kind component */
/**
 * The Custom-mode ladder controls of the pond: how many throws it sells, the
 * curve that cuts the climb, and the free-sequence chips when the curve is
 * "free". Each one is a line of the block's own grid, its name in the label
 * track and its control beside it, so they read as the same column of settings
 * the demand rows above them make.
 *
 * The climb's two ends are the rupee row of the ask block above
 * (PondAskControls), because they are the same pair of amounts: what the
 * ladder charges is what she asks for.
 */
import { Select, Slider } from '@ds/primitives';
import { JumpChipsEditor } from '../../JumpChipsEditor';
import { PondOptionLine } from './PondOptionLine';
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
  const { state, curveOptions, maxThrows } = model;
  const [low, high] = state.range;
  const span = high - low;

  return (
    <>
      <PondOptionLine label="throws the pond sells">
        <Slider
          value={Math.min(Math.max(state.throws, 1), maxThrows)}
          min={1}
          max={maxThrows}
          step={1}
          disabled={readOnly}
          formatValue={throwsLabel}
          onChange={(throws) => onChange({ throws })}
        />
      </PondOptionLine>
      <PondOptionLine label="price curve">
        <Select
          size="sm"
          value={state.curve}
          options={curveOptions as SelectOption[]}
          disabled={readOnly}
          onChange={(curve) => onChange({ curve: curve as PondRowState['curve'] })}
        />
      </PondOptionLine>
      {state.curve === 'free' && (
        <PondOptionLine label="price steps">
          <JumpChipsEditor
            jumps={state.jumps}
            span={span}
            disabled={readOnly}
            onChange={(jumps) => onChange({ jumps })}
          />
        </PondOptionLine>
      )}
    </>
  );
};

export { PondPriceControls };
export type { PondPriceControlsProps };
