/* @layer site-kit @kind component */
import { Flex, Tag, Text } from '@drizztdourden08/tessera/primitives';
import type { GroupChipsProps } from './GroupChips.type';

const GroupChips = (props: GroupChipsProps) => {
  const { groups, manualIds, roleIds, empty = 'no group' } = props;
  if (groups.length === 0) return <Text as="span" variant="caption">{empty}</Text>;
  return (
    <Flex gap="sm" align="center" wrap>
      {groups.map((group) => (
        <Flex key={group.id} gap="xs" align="center">
          <Tag color="primary">{group.name}</Tag>
          {manualIds.includes(group.id) && <Tag>by hand</Tag>}
          {roleIds.includes(group.id) && <Tag variant="urgency" color="info">Discord</Tag>}
        </Flex>
      ))}
    </Flex>
  );
};

export { GroupChips };
