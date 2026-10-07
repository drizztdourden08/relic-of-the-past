/* @layer sanctuary-site @kind component */
/**
 * One user in the admin queue: name, how they signed in, when, their groups (by hand or
 * from Discord) and the admin's buttons.
 */
import type { ReactNode } from 'react';
import { PROVIDER_LABELS } from '@shared/sanctuary/providers';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import type { AdminUser, GroupView } from '../../../api/types';
import { Row } from '../../../components/Row/Row';
import { GroupChips } from '../../../components/GroupChips/GroupChips';
import { formatDay } from '../../../lib/format-date';

type AdminUserRowProps = {
  row: AdminUser;
  /** Every group, to name the ones this person is in. */
  groups: readonly GroupView[];
  action?: ReactNode;
};

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
export type { AdminUserRowProps };
