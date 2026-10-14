/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { PoolImpactCell } from '../PoolImpactCell';
import type { RandomizerOptionRowProps } from './RandomizerOptionRow.type';
import { OptionControl } from './sub-components/OptionControl';
import { OptionText } from './sub-components/OptionText';
import './RandomizerOptionRow.css';

const RandomizerOptionRow = (props: RandomizerOptionRowProps) => {
  const { option, value, onChange, impact, disabled = false, note, readout = false } = props;
  const frozen = option.locked || disabled;
  const forced = note !== undefined && note !== '';

  return (
    <Box className={`rand-opt-row${frozen ? ' rand-opt-row--locked' : ''}${forced ? ' rand-opt-row--forced' : ''}`}>
      <OptionText option={option} note={note} forced={forced} />
      <Box className="rand-opt-row__control">
        <OptionControl option={option} value={value} frozen={frozen} readout={readout} onChange={onChange} />
      </Box>
      {impact !== undefined ? <PoolImpactCell cell={impact} /> : <Box />}
    </Box>
  );
};

export { RandomizerOptionRow };
export type { RandomizerOptionRowProps };
