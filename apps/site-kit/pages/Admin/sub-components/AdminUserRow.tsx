/* @layer site-kit @kind component */
import { PROVIDER_LABELS } from '@shared/hub/providers';
import { ListItemRow } from '@drizztdourden08/tessera/composites';
import { GroupChips } from '../../../components/GroupChips/GroupChips';
import { formatDay } from '../../../lib/format-date';
import type { AdminUserRowProps } from './AdminUserRow.type';

const AdminUserRow = (props: AdminUserRowProps) => {
  const { row, groups, action } = props;
  const { user, identities } = row;
  const methods = identities.map((identity) => `${PROVIDER_LABELS[identity.provider]} ${identity.handle}`).join(', ');
  const inGroups = groups.filter((group) => user.groupIds.includes(group.id) || user.roleGroupIds.includes(group.id));
  const groupChips = <GroupChips groups={inGroups} manualIds={user.groupIds} roleIds={user.roleGroupIds} />;
  return (
    <ListItemRow
      name={user.displayName}
      meta={`${methods || 'no identity'} · since ${formatDay(user.createdAt)}`}
      columns={[{ primary: groupChips }]}
      action={action}
      actionVisibility="always"
    />
  );
};

export { AdminUserRow };
