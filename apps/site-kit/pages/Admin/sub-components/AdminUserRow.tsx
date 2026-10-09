/* @layer site-kit @kind component */
import { PROVIDER_LABELS } from '@shared/hub/providers';
import { Stack, Text } from '@drizztdourden08/tessera/primitives';
import { Row } from '../../../components/Row/Row';
import { GroupChips } from '../../../components/GroupChips/GroupChips';
import { formatDay } from '../../../lib/format-date';
import type { AdminUserRowProps } from './AdminUserRow.type';

const AdminUserRow = (props: AdminUserRowProps) => {
  const { row, groups, action } = props;
  const { user, identities } = row;
  const methods = identities.map((identity) => `${PROVIDER_LABELS[identity.provider]} ${identity.handle}`).join(', ');
  const inGroups = groups.filter((group) => user.groupIds.includes(group.id) || user.roleGroupIds.includes(group.id));
  const value = (
    <Stack gap="xs" align="start">
      <Text as="span" variant="caption">{`${methods || 'no identity'} · since ${formatDay(user.createdAt)}`}</Text>
      <GroupChips groups={inGroups} manualIds={user.groupIds} roleIds={user.roleGroupIds} />
    </Stack>
  );
  return <Row label={user.displayName} value={value} action={action} />;
};

export { AdminUserRow };
