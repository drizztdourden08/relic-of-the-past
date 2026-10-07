/* @layer renderer-components @kind component */
/**
 * The rail of text groups. Every group there is gets one line, with the one
 * being worked on marked.
 *
 * Each line carries its own tally so a translator can see where the work is
 * without opening every group in turn. The tallies are read from the same
 * override map the rows use, so a key the caller supplies counts wherever it
 * belongs; a caller that hands over only the open group's words gets a live
 * tally there and a resting one everywhere else.
 */
import { Box, Text } from '@ds/primitives';
import { TextGroupRailItem } from './TextGroupRailItem';
import { tallyOf } from './text-groups.model';
import type { TextGroup, TextGroupId } from '@shared/game/language';
import './TextGroupRail.css';

type TextGroupRailProps = {
  groups: TextGroup[];
  activeGroup: TextGroupId;
  /** Overrides by slot key, used for each group's tally. */
  values: Record<string, string>;
  onSelectGroup: (id: TextGroupId) => void;
};

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
export type { TextGroupRailProps };
