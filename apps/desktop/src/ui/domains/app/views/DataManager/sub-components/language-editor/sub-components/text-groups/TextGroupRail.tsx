/* @layer renderer-components @kind component */
import { ListItemList } from '@drizztdourden08/tessera/composites';
import { TextGroupRailItem } from './TextGroupRailItem';
import { tallyOf } from './tally-of';
import type { TextGroupRailProps } from './TextGroupRail.type';
import './TextGroupRail.css';

const TextGroupRail = (props: TextGroupRailProps) => {
  const { groups, activeGroup, values, onSelectGroup } = props;

  return (
    <ListItemList className="text-group-rail" heading="Groups" label="Text groups">
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
    </ListItemList>
  );
};

export { TextGroupRail };
