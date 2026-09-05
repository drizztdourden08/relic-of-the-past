/* @layer renderer-components @kind component */
/**
 * One entry in the rail: a group's name and how much of it is written.
 *
 * A group with no slots is LISTED, not hidden. A dataset can legitimately come
 * back with nothing in it, and a rail that silently drops the entry leaves a
 * translator hunting for a group that is empty today. So it says so, in
 * plain words, where its tally would be.
 */
import { useCallback } from 'react';
import { Box, Button, Text } from '@ds/primitives';
import type { TextGroup, TextGroupId } from '@shared/game/language';

type TextGroupRailItemProps = {
  group: TextGroup;
  /** Slots in this group the translator has written words for. */
  translated: number;
  /** False when this group's overrides were not supplied (see `GroupTally`). */
  showTally: boolean;
  selected: boolean;
  onSelect: (id: TextGroupId) => void;
};

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
export type { TextGroupRailItemProps };
