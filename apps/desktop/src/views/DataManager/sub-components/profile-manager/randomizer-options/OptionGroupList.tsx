/* @layer renderer-components @kind component */
import { useText } from '@drizztdourden08/brock-react';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import { OptionGroup } from '@drizztdourden08/tessera/composites';
import { RandomizerOptionRow } from '@app/compounds/RandomizerOptionRow';
import type { OptionGroupListProps } from './OptionGroupList.type';

const OptionGroupList = (props: OptionGroupListProps) => {
  const text = useText();
  const noteOf = (note: Message | undefined): string | undefined => (note === undefined ? undefined : text(note));
  const { groups, valueOf, cellOf, live = false, frozenKeys, notes, onRowChange, readout } = props;

  return (
    <>
      {groups.map(({ group, options }) => (
        <OptionGroup key={`${live ? 'live-' : ''}${group.id}`} title={text(group.label)} tone={live ? 'live' : 'default'}>
          {options.map((option) => (
            <RandomizerOptionRow
              key={option.key}
              option={option}
              value={valueOf(option)}
              impact={cellOf(option.key)}
              readout={readout}
              disabled={frozenKeys?.has(option.key)}
              note={noteOf(notes?.get(option.key))}
              onChange={onRowChange === undefined ? undefined : (next) => onRowChange(option.key, next)}
            />
          ))}
        </OptionGroup>
      ))}
    </>
  );
};

export { OptionGroupList };
