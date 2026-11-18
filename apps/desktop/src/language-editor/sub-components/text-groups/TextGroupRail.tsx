/* @layer renderer-components @kind component */
import { ListItemList } from '@drizztdourden08/tessera/composites';
import { useT } from '@drizztdourden08/brock-react';
import { TextGroupRailItem } from './TextGroupRailItem';
import { tallyOf } from './tally-of';
import type { TextGroupRailProps } from './TextGroupRail.type';
import './TextGroupRail.css';

const TextGroupRail = (props: TextGroupRailProps) => {
  const { groups, activeGroup, values, onSelectGroup } = props;
  const t = useT();

  return (
    <ListItemList className="text-group-rail" heading={t('language-editor:groups.heading')} label={t('language-editor:groups.label')}>
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
