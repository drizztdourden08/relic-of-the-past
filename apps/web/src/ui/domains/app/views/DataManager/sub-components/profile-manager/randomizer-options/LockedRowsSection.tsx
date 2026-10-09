/* @layer renderer-components @kind component */
import { RandomizerOptionGroup } from '@domains/app/compounds/RandomizerOptionGroup';
import { RandomizerOptionRow } from '@domains/app/compounds/RandomizerOptionRow';
import type { LockedRowsSectionProps } from './LockedRowsSection.type';

const LockedRowsSection = (props: LockedRowsSectionProps) => {
  const { title, groups, valueOf, cellOf, readout } = props;

  const options = groups.flatMap((entry) => entry.options);
  if (options.length === 0) return null;

  return (
    <RandomizerOptionGroup title={title}>
      {options.map((option) => (
        <RandomizerOptionRow
          key={option.key}
          option={option}
          value={valueOf(option)}
          impact={cellOf(option.key)}
          readout={readout}
        />
      ))}
    </RandomizerOptionGroup>
  );
};

export { LockedRowsSection };
