/* @layer renderer-components @kind component */
import { useT, useText } from '@drizztdourden08/brock-react';
import { Box, SegmentedControl } from '@drizztdourden08/tessera/primitives';
import { DEFAULT_MODES } from '../../behavior/layer-ops.constants';
import { IntervalTimes } from '../IntervalTimes';
import { MODE_HINTS, MODE_KINDS, MODE_LABELS } from './PlayModeFields.constants';
import { LoopFields } from './sub-components/LoopFields';
import { RandomFields } from './sub-components/RandomFields';
import type { PlayModeFieldsProps } from './PlayModeFields.type';

const PlayModeFields = (props: PlayModeFieldsProps) => {
  const { mode, layerId, disabled = false, onChange } = props;
  const t = useT();
  const text = useText();
  const options = MODE_KINDS.map((kind) => ({ value: kind, label: text(MODE_LABELS[kind]) }));

  return (
    <Box className="layer-card__modes">
      <SegmentedControl
        label={t('msu-studio:layers.mode.label')}
        description={text(MODE_HINTS[mode.kind])}
        value={mode.kind}
        options={options}
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
