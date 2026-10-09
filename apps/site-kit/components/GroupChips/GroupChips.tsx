/* @layer site-kit @kind component */
import { Flex, Text } from '@drizztdourden08/tessera/primitives';
import { Chip } from '../Chip/Chip';
import type { GroupChipsProps } from './GroupChips.type';

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
