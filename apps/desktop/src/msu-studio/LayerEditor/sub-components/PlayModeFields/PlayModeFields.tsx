/* @layer renderer-components @kind component */
import { Box, SegmentedControl } from '@drizztdourden08/tessera/primitives';
import { DEFAULT_MODES } from '../../behavior/layer-ops.constants';
import { IntervalTimes } from '../IntervalTimes';
import { MODE_HINTS, MODE_OPTIONS } from './PlayModeFields.constants';
import { LoopFields } from './sub-components/LoopFields';
import { RandomFields } from './sub-components/RandomFields';
import type { PlayModeFieldsProps } from './PlayModeFields.type';

const PlayModeFields = (props: PlayModeFieldsProps) => {
  const { mode, layerId, disabled = false, onChange } = props;

  return (
    <Box className="layer-card__modes">
      <SegmentedControl
        label="Play mode"
        description={MODE_HINTS[mode.kind]}
        value={mode.kind}
        options={MODE_OPTIONS}
        disabled={disabled}
        onChange={(kind) => onChange(DEFAULT_MODES[kind])}
      />

      {mode.kind === 'loop' && <LoopFields mode={mode} layerId={layerId} disabled={disabled} onChange={onChange} />}

      {mode.kind === 'random' && <RandomFields mode={mode} layerId={layerId} disabled={disabled} onChange={onChange} />}

      {mode.kind === 'interval' && (
        <IntervalTimes
          atSeconds={mode.atSeconds}
          disabled={disabled}
          onChange={(atSeconds) => onChange({ kind: 'interval', atSeconds })}
        />
      )}
    </Box>
  );
};

export { PlayModeFields };
