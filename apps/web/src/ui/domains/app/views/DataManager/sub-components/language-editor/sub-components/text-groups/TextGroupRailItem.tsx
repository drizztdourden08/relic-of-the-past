/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box, Button, Text } from '@ds/primitives';
import type { TextGroupRailItemProps } from './TextGroupRailItem.type';

const TextGroupRailItem = (props: TextGroupRailItemProps) => {
  const { group, translated, showTally, selected, onSelect } = props;

  const handleSelect = useCallback(() => onSelect(group.id), [group.id, onSelect]);

  const total = group.slots.length;
  const done = total > 0 && translated === total;
  const tally = showTally ? `${translated} of ${total} written` : `${total} slots`;
  const className = `text-group-rail__item${selected ? ' text-group-rail__item--selected' : ''}`;

  return (
    <Button
      variant="bare"
      className={className}
      aria-current={selected}
      onClick={handleSelect}
    >
      <Box className="text-group-rail__body">
        <Text as="span" className="text-group-rail__title">{group.title}</Text>

        {total === 0 ? (
          <Text as="span" className="text-group-rail__tally">no text available</Text>
        ) : (
          <Text as="span" className="text-group-rail__tally" data-done={done && showTally}>
            {tally}
          </Text>
        )}
      </Box>
    </Button>
  );
};

export { TextGroupRailItem };
