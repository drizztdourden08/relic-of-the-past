/* @layer renderer-components @kind component */
import { Select, Slider } from '@drizztdourden08/tessera/primitives';
import { JumpChipsEditor } from '../../JumpChipsEditor';
import { OptionValueTag, choiceLabelOf, stepsLabelOf } from '../../OptionValueTag';
import { PondOptionLine } from './PondOptionLine';
import type { PondControlsProps, PondRowState } from '../WishingPondRow.type';

const throwsLabel = (count: number): string => `${count} throw${count === 1 ? '' : 's'}`;

const PondPriceControls = (props: PondControlsProps) => {
  const { model, readOnly, readout = false, onChange } = props;
  const { state, curveOptions, maxThrows } = model;
  const [low, high] = state.range;
  const span = high - low;
  const throws = Math.min(Math.max(state.throws, 1), maxThrows);
  const curveLabel = choiceLabelOf(curveOptions, state.curve);

  return (
    <>
      <PondOptionLine label="throws the pond sells">
        {readout ? <OptionValueTag value={throwsLabel(throws)} /> : (
          <Slider
            value={throws}
            min={1}
            max={maxThrows}
            step={1}
            disabled={readOnly}
            formatValue={throwsLabel}
            onChange={(next) => onChange({ throws: next })}
          />
        )}
      </PondOptionLine>
      <PondOptionLine label="price curve">
        {readout ? <OptionValueTag value={curveLabel} /> : (
          <Select
            size="sm"
            value={state.curve}
            options={curveOptions}
            disabled={readOnly}
            onChange={(curve) => onChange({ curve: curve as PondRowState['curve'] })}
          />
        )}
      </PondOptionLine>
      {state.curve === 'free' && (
        <PondOptionLine label="price steps">
          {readout ? <OptionValueTag value={stepsLabelOf(state.jumps)} /> : (
            <JumpChipsEditor
              jumps={state.jumps}
              span={span}
              disabled={readOnly}
              onChange={(jumps) => onChange({ jumps })}
            />
          )}
        </PondOptionLine>
      )}
    </>
  );
};

export { PondPriceControls };
