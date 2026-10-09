/* @layer renderer-components @kind component */
import { Slider, Text } from '@drizztdourden08/tessera/primitives';
import { RowLine } from './RowLine';
import type { LadderControlsProps } from '../CapacityFamilyRow.type';

const LadderRange = (props: LadderControlsProps) => {
  const { model, readOnly, onChange } = props;
  const { stops, state, rangeStep, labelEvery, label, floorNote } = model;
  const [start, max] = state.range;

  return (
    <RowLine label="range" note={floorNote}>
      <Slider
        range
        className="capacity-row__range"
        stops={stops}
        value={state.range}
        keyStep={rangeStep}
        labels={`every ${labelEvery}`}
        showValue={false}
        disabled={readOnly}
        aria-label={label}
        onChange={(range) => onChange({ range })}
      />
      <Text className="capacity-row__readout">{`${stops[start]} to ${stops[max]}`}</Text>
    </RowLine>
  );
};

export { LadderRange };
