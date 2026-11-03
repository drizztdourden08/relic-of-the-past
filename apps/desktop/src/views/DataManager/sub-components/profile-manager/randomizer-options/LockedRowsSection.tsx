/* @layer renderer-components @kind component */
import { OptionGroup } from '@drizztdourden08/tessera/composites';
import { RandomizerOptionRow } from '@app/compounds/RandomizerOptionRow';
import type { LockedRowsSectionProps } from './LockedRowsSection.type';

const LockedRowsSection = (props: LockedRowsSectionProps) => {
  const { title, groups, valueOf, cellOf, readout } = props;

  const options = groups.flatMap((entry) => entry.options);
  if (options.length === 0) return null;

  return (
    <OptionGroup title={title}>
      {options.map((option) => (
        <RandomizerOptionRow
          key={option.key}
          option={option}
          value={valueOf(option)}
          impact={cellOf(option.key)}
          readout={readout}
        />
      ))}
    </OptionGroup>
  );
};

export { LockedRowsSection };
