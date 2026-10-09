/* @layer renderer-components @kind component */
import { Box, RangeSlider, Select, Slider, Text } from '@ds/primitives';
import { JumpChipsEditor } from '../../JumpChipsEditor';
import { LadderReadout } from './LadderReadout';
import { RowLine } from './RowLine';
import { itemsLabel } from '../behavior/items-label';
import type { SelectGroup } from '@ds/primitives';
import type { CapacityRowState, LadderControlsProps } from '../CapacityFamilyRow.type';

const LadderControls = (props: LadderControlsProps) => {
  const { model, readOnly, readout = false, onChange } = props;
  if (readout) return <LadderReadout model={model} />;
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

export { LadderControls };
