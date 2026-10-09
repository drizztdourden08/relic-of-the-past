/* @layer renderer-components @kind component */
import { RandomizerOptionRow } from '@app/compounds/RandomizerOptionRow';
import { RandomizerOptionGroup } from '@app/compounds/RandomizerOptionGroup';
import type { OptionGroupListProps } from './OptionGroupList.type';

const OptionGroupList = (props: OptionGroupListProps) => {
  const { groups, valueOf, cellOf, live = false, frozenKeys, notes, onRowChange, readout } = props;

  return (
    <>
      {groups.map(({ group, options }) => (
        <RandomizerOptionGroup key={`${live ? 'live-' : ''}${group.id}`} title={group.label} live={live}>
          {options.map((option) => (
            <RandomizerOptionRow
              key={option.key}
              option={option}
              value={valueOf(option)}
              impact={cellOf(option.key)}
              readout={readout}
              disabled={frozenKeys?.has(option.key)}
              note={notes?.get(option.key)}
              onChange={onRowChange === undefined ? undefined : (next) => onRowChange(option.key, next)}
            />
          ))}
        </RandomizerOptionGroup>
      ))}
    </>
  );
};

export { OptionGroupList };
