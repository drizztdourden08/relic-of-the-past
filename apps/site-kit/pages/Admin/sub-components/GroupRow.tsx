/* @layer site-kit @kind component */
import { DEFAULT_GROUP_ID } from '@shared/hub/group-types';
import { Button, Flex, Tag, Text } from '@drizztdourden08/tessera/primitives';
import { ListItemRow } from '@drizztdourden08/tessera/composites';
import type { GroupRowProps } from './GroupRow.type';

const GroupRow = (props: GroupRowProps) => {
  const { group, summary, busy, onEdit, onDelete } = props;
  const isDefault = group.id === DEFAULT_GROUP_ID;
  const value = (
    <Flex gap="sm" align="center" wrap>
      {isDefault && <Tag color="primary">default</Tag>}
      <Text as="span" variant="caption">{summary}</Text>
    </Flex>
  );
  const action = (
    <>
      <Button variant="ghost" size="sm" disabled={busy} onClick={() => onEdit(group)}>Edit</Button>
      {!isDefault && <Button variant="ghost" size="sm" disabled={busy} onClick={() => onDelete(group)}>Delete</Button>}
    </>
  );
  return <ListItemRow name={group.name} columns={[{ primary: value }]} action={action} actionVisibility="always" />;
};

export { GroupRow };
