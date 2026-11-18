/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Text } from '@drizztdourden08/tessera/primitives';
import { ListItemRow } from '@drizztdourden08/tessera/composites';
import { useT } from '@drizztdourden08/brock-react';
import type { TextGroupRailItemProps } from './TextGroupRailItem.type';

const TextGroupRailItem = (props: TextGroupRailItemProps) => {
  const { group, translated, showTally, selected, onSelect } = props;
  const t = useT();

  const handleSelect = useCallback(() => onSelect(group.id), [group.id, onSelect]);

  const total = group.slots.length;
  const done = total > 0 && translated === total;
  const tally = showTally
    ? t('language-editor:groups.tally-written', { translated, total })
    : t('language-editor:groups.tally-slots', { total });

  return (
    <ListItemRow
      name={group.title}
      meta={(
        <Text as="span" className="text-group-rail__tally" data-done={done && showTally}>
          {total === 0 ? t('language-editor:groups.tally-none') : tally}
        </Text>
      )}
      selected={selected}
      onClick={handleSelect}
    />
  );
};

export { TextGroupRailItem };
