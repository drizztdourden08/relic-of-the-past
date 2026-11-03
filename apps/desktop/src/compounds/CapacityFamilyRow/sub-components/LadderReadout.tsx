/* @layer renderer-components @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import { ValueTag } from '@drizztdourden08/tessera/composites';
import { choiceLabelOf, rangeLabelOf, stepsLabelOf } from '@app/hooks/randomizer/option-labels';
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
        <ValueTag value={rangeLabelOf(stops, state.range)} />
      </RowLine>
      <RowLine label="items">
        <ValueTag value={itemsLabel(count)} />
        {hasCurve
          ? <ValueTag value={choiceLabelOf(curveOptions, state.curve)} />
          : <Text className="capacity-row__aside">one level per item</Text>}
      </RowLine>
      {hasCurve && state.curve === 'free' && (
        <RowLine label="jumps">
          <ValueTag value={stepsLabelOf(state.jumps)} />
        </RowLine>
      )}
    </>
  );
};

export { LadderReadout };
