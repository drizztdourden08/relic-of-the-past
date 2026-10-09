/* @layer site-kit @kind component */
import { useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AdminUser } from '../../api/hub-responses.type';
import { Stack, Box, Flex, Button, Text } from '@drizztdourden08/tessera/primitives';
import { ListItemList, SettingsSection } from '@drizztdourden08/tessera/composites';
import { SitePage } from '../../layout/SitePage/SitePage';
import { AdminUserRow } from './sub-components/AdminUserRow';
import { GroupsSection } from './sub-components/GroupsSection';
import { MemberGroups } from './sub-components/MemberGroups';
import { useAdminQueue } from './behavior/useAdminQueue';
import { useGroups } from './behavior/useGroups';
import { ANCHORS } from './Admin.constants';
import './Admin.css';

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
            <ListItemList label="Pending">{byState.pending.map((row) => userRow(row, pendingActions(row)))}</ListItemList>
          </SettingsSection>
        </Box>

        <Box data-section="members">
          <SettingsSection title="Members" description={members === 1 ? '1 member' : `${members} members`}>
            <ListItemList label="Members">
              {byState.admin.map((row) => userRow(row))}
              {byState.member.map((row) => userRow(row, memberActions(row)))}
            </ListItemList>
          </SettingsSection>
        </Box>

        <Box data-section="revoked">
          <SettingsSection title="Revoked" description={`${byState.revoked.length} revoked`}>
            {!loading && byState.revoked.length === 0 && empty('Nobody is revoked.')}
            <ListItemList label="Revoked">{byState.revoked.map((row) => userRow(row, groupsMenu(row)))}</ListItemList>
          </SettingsSection>
        </Box>
      </Stack>
    </SitePage>
  );
};

export { Admin };
