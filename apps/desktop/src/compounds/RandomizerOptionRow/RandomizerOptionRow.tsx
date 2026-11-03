/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { OptionRow } from '@drizztdourden08/tessera/composites';
import { OptionDescription } from '../OptionDescription';
import { PoolImpactCell } from '../PoolImpactCell';
import { tagFor } from './behavior/tag-for';
import type { RandomizerOptionRowProps } from './RandomizerOptionRow.type';
import { OptionControl } from './sub-components/OptionControl';

const RandomizerOptionRow = (props: RandomizerOptionRowProps) => {
  const { option, value, onChange, impact, disabled = false, note, readout = false } = props;
  const forced = note !== undefined && note !== '';
  const description = option.details ?? option.description;

  return (
    <OptionRow
      label={option.displayName}
      description={description.length === 0 ? undefined : <OptionDescription description={description} />}
      tag={tagFor(option) ?? undefined}
      note={note}
      locked={option.locked || disabled}
      forced={forced}
      control={<OptionControl option={option} value={value} frozen={option.locked || disabled} readout={readout} onChange={onChange} />}
      aside={impact !== undefined ? <PoolImpactCell cell={impact} /> : <Box />}
    />
  );
};

export { RandomizerOptionRow };
