/* @layer renderer-components @kind component */
/**
 * The Custom-mode lines of a capacity family drawn read-only: the same lines
 * CustomControls asks on (range, items and curve, jumps while the curve is
 * Free), each value shown as a tag in place of its control. The read-only
 * Options page's face of a Custom family.
 */
import { Text } from '@ds/primitives';
import { OptionValueTag, choiceLabelOf, rangeLabelOf, stepsLabelOf } from '../../OptionValueTag';
import { RowLine } from './RowLine';
import { itemsLabel } from '../behavior/items-label';
import type { CapacityRowModel } from '../CapacityFamilyRow.type';

interface CustomReadoutProps {
  model: CapacityRowModel;
}

const CustomReadout = (props: CustomReadoutProps) => {
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

export { CustomReadout };
export type { CustomReadoutProps };
