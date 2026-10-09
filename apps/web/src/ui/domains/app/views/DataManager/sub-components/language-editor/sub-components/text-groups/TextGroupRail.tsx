/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { TextGroupRailItem } from './TextGroupRailItem';
import { tallyOf } from './tally-of';
import type { TextGroupRailProps } from './TextGroupRail.type';
import './TextGroupRail.css';

const TextGroupRail = (props: TextGroupRailProps) => {
  const { groups, activeGroup, values, onSelectGroup } = props;

  return (
    <Box className="text-group-rail" role="navigation" aria-label="Text groups">
      <Text as="span" className="text-group-rail__heading">Groups</Text>

      {groups.map((group) => {
        const selected = group.id === activeGroup;
        const tally = tallyOf(group, values, selected);

        return (
          <TextGroupRailItem
            key={group.id}
            group={group}
            translated={tally.translated}
            showTally={tally.known}
            selected={selected}
            onSelect={onSelectGroup}
          />
        );
      })}
    </Box>
  );
};

export { TextGroupRail };
