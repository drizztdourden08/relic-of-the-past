/* @layer sanctuary-site @kind component */
/**
 * A person's groups as pills, each followed by where the membership comes from: "by
 * hand" for one an admin set, "Discord" for one a Discord role gives. A group with
 * neither (the default group a GitHub collaborator falls back to) shows no marker.
 */
import type { Group } from '@shared/sanctuary/group-types';
import { Flex } from '@ds/primitives/Flex';
import { Text } from '@ds/primitives/Text';
import { Chip } from '../Chip/Chip';

type GroupChipsProps = {
  groups: readonly Pick<Group, 'id' | 'name'>[];
  /** Groups an admin set by hand. */
  manualIds: readonly string[];
  /** Groups a Discord role gives. */
  roleIds: readonly string[];
  /** Shown when there is no group at all. */
  empty?: string;
};

const GroupChips = (props: GroupChipsProps) => {
  const { groups, manualIds, roleIds, empty = 'no group' } = props;
  if (groups.length === 0) return <Text as="span" variant="caption">{empty}</Text>;
  return (
    <Flex gap="sm" align="center" wrap>
      {groups.map((group) => (
        <Flex key={group.id} gap="xs" align="center">
          <Chip tone="gold">{group.name}</Chip>
          {manualIds.includes(group.id) && <Chip tone="muted">by hand</Chip>}
          {roleIds.includes(group.id) && <Chip tone="info">Discord</Chip>}
        </Flex>
      ))}
    </Flex>
  );
};

export { GroupChips };
export type { GroupChipsProps };
