/* @layer renderer-components @kind component */
import { Text } from '@ds/primitives';
import { OptionValueTag, choiceLabelOf, rangeLabelOf, stepsLabelOf } from '../../OptionValueTag';
import { RowLine } from './RowLine';
import { itemsLabel } from '../behavior/items-label';
import type { LadderReadoutProps } from '../CapacityFamilyRow.type';

const LadderReadout = (props: LadderReadoutProps) => {
  const { model } = props;
  const { stops, state, span, minCount, maxCount, hasCurve, curveOptions, floorNote } = model;
  const count = maxCount > minCount ? Math.max(minCount, Math.min(state.count, maxCount)) : Math.min(minCount, span);

  return (
    <>
      <RowLine label="range" note={floorNote}>
        <OptionValueTag value={rangeLabelOf(stops, state.range)} />
      </RowLine>
      <RowLine label="items">
        <OptionValueTag value={itemsLabel(count)} />
        {hasCurve
          ? <OptionValueTag value={choiceLabelOf(curveOptions, state.curve)} />
          : <Text className="capacity-row__aside">one level per item</Text>}
      </RowLine>
      {hasCurve && state.curve === 'free' && (
        <RowLine label="jumps">
          <OptionValueTag value={stepsLabelOf(state.jumps)} />
        </RowLine>
      )}
    </>
  );
};

export { LadderReadout };
