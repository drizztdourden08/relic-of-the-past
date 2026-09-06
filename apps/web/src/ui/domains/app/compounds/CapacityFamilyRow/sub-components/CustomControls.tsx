/* @layer renderer-components @kind component */
/**
 * The Custom-mode lines of a capacity family, one fact per line: the range
 * (the start–max thumbs on the family's legal tiers, the readout beside them,
 * the floor the final max may not stop below as the line's note); the items
 * (the count between the floor the item cap sets and the ceiling the pool
 * allows, with the curve dropdown beside it, presets under a divider); and,
 * only while the curve is Free, the jumps (the chip editor, which carries its
 * own sum and problem line). A span with a single possible count reads as
 * text; a family without a curve (the meter) says so in the curve's place.
 */
import { Box, RangeSlider, Select, Slider, Text } from '@ds/primitives';
import { JumpChipsEditor } from '../../JumpChipsEditor';
import { RowLine } from './RowLine';
import type { SelectGroup } from '@ds/primitives';
import type { CapacityRowModel, CapacityRowState } from '../CapacityFamilyRow.type';

interface CustomControlsProps {
  model: CapacityRowModel;
  readOnly: boolean;
  onChange: (part: Partial<CapacityRowState>) => void;
}

const itemsLabel = (count: number): string => `${count} item${count === 1 ? '' : 's'}`;

const CustomControls = (props: CustomControlsProps) => {
  const { model, readOnly, onChange } = props;
  const {
    stops, state, rangeStep, labelEvery, span, minCount, maxCount, maxJump, hasCurve, curveOptions,
    problem, label, floorNote,
  } = model;
  const [start, max] = state.range;

  return (
    <>
      <RowLine label="range" note={floorNote}>
        <RangeSlider
          className="capacity-row__range"
          stops={stops}
          value={state.range}
          step={rangeStep}
          labelEvery={labelEvery}
          disabled={readOnly}
          ariaLabel={label}
          onChange={(range) => onChange({ range })}
        />
        <Text className="capacity-row__readout">{`${stops[start]} to ${stops[max]}`}</Text>
      </RowLine>
      <RowLine label="items">
        {maxCount > minCount ? (
          <Box className="capacity-row__grow">
            <Slider
              value={Math.max(minCount, Math.min(state.count, maxCount))}
              min={minCount}
              max={maxCount}
              step={1}
              disabled={readOnly}
              formatValue={itemsLabel}
              onChange={(count) => onChange({ count })}
            />
          </Box>
        ) : (
          <Text className="capacity-row__readout">{itemsLabel(Math.min(minCount, span))}</Text>
        )}
        {hasCurve ? (
          <Select
            className="capacity-row__curve"
            size="sm"
            value={state.curve}
            groups={curveOptions as SelectGroup[]}
            disabled={readOnly}
            onChange={(curve) => onChange({ curve: curve as CapacityRowState['curve'] })}
          />
        ) : (
          <Text className="capacity-row__aside">one level per item</Text>
        )}
      </RowLine>
      {hasCurve && state.curve === 'free' && (
        <RowLine label="jumps">
          <JumpChipsEditor
            jumps={state.jumps}
            span={span}
            maxJump={maxJump}
            problem={problem}
            disabled={readOnly}
            onChange={(jumps) => onChange({ jumps })}
          />
        </RowLine>
      )}
    </>
  );
};

export { CustomControls };
export type { CustomControlsProps };
