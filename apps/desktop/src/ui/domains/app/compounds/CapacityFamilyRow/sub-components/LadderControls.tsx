/* @layer renderer-components @kind component */
import { Box, Select, Slider, Text } from '@drizztdourden08/tessera/primitives';
import { JumpChipsEditor } from '../../JumpChipsEditor';
import { LadderRange } from './LadderRange';
import { LadderReadout } from './LadderReadout';
import { RowLine } from './RowLine';
import { itemsLabel } from '../behavior/items-label';
import type { CapacityRowState, LadderControlsProps } from '../CapacityFamilyRow.type';

const LadderControls = (props: LadderControlsProps) => {
  const { model, readOnly, readout = false, onChange } = props;
  if (readout) return <LadderReadout model={model} />;
  const { state, span, minCount, maxCount, maxJump, hasCurve, curveOptions, problem } = model;

  return (
    <>
      <LadderRange model={model} readOnly={readOnly} onChange={onChange} />
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
            groups={curveOptions}
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
