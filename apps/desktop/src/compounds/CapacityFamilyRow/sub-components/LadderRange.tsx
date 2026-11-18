/* @layer renderer-components @kind component */
import { Slider, Text } from '@drizztdourden08/tessera/primitives';
import { useT } from '@drizztdourden08/brock-react';
import { RowLine } from './RowLine';
import type { LadderControlsProps } from '../CapacityFamilyRow.type';

const LadderRange = (props: LadderControlsProps) => {
  const { model, readOnly, onChange } = props;
  const t = useT();
  const { stops, state, rangeStep, labelEvery, label, floorNote } = model;
  const [start, max] = state.range;

  return (
    <RowLine label={t('compounds:capacity.row.range')} note={floorNote}>
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
      <Text className="capacity-row__readout">{t('compounds:capacity.range-to', { from: stops[start] ?? '', to: stops[max] ?? '' })}</Text>
    </RowLine>
  );
};

export { LadderRange };
