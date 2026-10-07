/* @layer sanctuary-site @kind component */
/**
 * The admin page: the groups first, then the pending queue, the members and the revoked
 * users. Each person gets a Groups menu for the groups an admin sets by hand; pending
 * users can be ignored and members revoked.
 */
import { useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AdminUser } from '../../api/types';
import { Stack } from '@ds/primitives/Stack';
import { Box } from '@ds/primitives/Box';
import { Flex } from '@ds/primitives/Flex';
import { Button } from '@ds/primitives/Button';
import { Text } from '@ds/primitives/Text';
import { SettingsSection } from '@ds/composites/SettingsSection';
import { SitePage } from '../../layout/SitePage/SitePage';
import { AdminUserRow } from './sub-components/AdminUserRow';
import { GroupsSection } from './sub-components/GroupsSection';
import { MemberGroups } from './sub-components/MemberGroups';
import { useAdminQueue } from './behavior/useAdminQueue';
import { useGroups } from './behavior/useGroups';
import './Admin.css';

const ANCHORS = [
  { id: 'groups', label: 'Groups' },
  { id: 'pending', label: 'Pending' },
  { id: 'members', label: 'Members' },
  { id: 'revoked', label: 'Revoked' },
];

const Admin = () => {
  const { loading, byState, busyId, error, setGroups, revoke } = useAdminQueue();
  const groupsState = useGroups();
  const { groups, reload } = groupsState;

  const changeGroups = useCallback((userId: string, groupIds: string[]) => {
    void setGroups(userId, groupIds).then(reload);
  }, [setGroups, reload]);

  const groupsMenu = (row: AdminUser) => (
    <MemberGroups user={row.user} groups={groups} busy={busyId === row.user.id} onChange={changeGroups} />
  );
  const pendingActions = (row: AdminUser) => (
    <Flex gap="xs">
      {groupsMenu(row)}
      <Button variant="ghost" size="sm" disabled={busyId === row.user.id} onClick={() => void revoke(row.user.id)}>Ignore</Button>
    </Flex>
  );
  const memberActions = (row: AdminUser) => (
    <Flex gap="xs">
      {groupsMenu(row)}
      <Button variant="danger" size="sm" disabled={busyId === row.user.id} onClick={() => void revoke(row.user.id)}>Revoke</Button>
    </Flex>
  );

  const empty = (text: string) => <Text as="p" variant="caption">{text}</Text>;
  const userRow = (row: AdminUser, action?: ReactNode) => (
    <AdminUserRow key={row.user.id} row={row} groups={groups} action={action} />
  );
  const members = byState.member.length + byState.admin.length;

  return (
    <SitePage section="admin" anchors={ANCHORS}>
      <Stack gap="xl" align="stretch" className="admin">
        <Box data-section="groups">
          <GroupsSection state={groupsState} />
        </Box>

        {loading && empty('Loading users')}
        {error && <Text as="p" variant="caption" role="alert">{error}</Text>}

        <Box data-section="pending">
          <SettingsSection title="Pending" description={`${byState.pending.length} waiting`}>
            {!loading && byState.pending.length === 0 && empty('Nobody is waiting.')}
            {byState.pending.map((row) => userRow(row, pendingActions(row)))}
          </SettingsSection>
        </Box>

        <Box data-section="members">
          <SettingsSection title="Members" description={members === 1 ? '1 member' : `${members} members`}>
            {byState.admin.map((row) => userRow(row))}
            {byState.member.map((row) => userRow(row, memberActions(row)))}
          </SettingsSection>
        </Box>

        <Box data-section="revoked">
          <SettingsSection title="Revoked" description={`${byState.revoked.length} revoked`}>
            {!loading && byState.revoked.length === 0 && empty('Nobody is revoked.')}
            {byState.revoked.map((row) => userRow(row, groupsMenu(row)))}
          </SettingsSection>
        </Box>
      </Stack>
    </SitePage>
  );
};

export { Admin };
