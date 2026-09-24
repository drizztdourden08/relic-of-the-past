/* @layer sanctuary-site @kind component */
/**
 * The admin page: the pending queue with Grant and Ignore, then the members and the
 * revoked users, each with the one button that moves them.
 */
import type { AdminUser } from '../../api/types';
import { Stack } from '@ds/primitives/Stack';
import { Box } from '@ds/primitives/Box';
import { Flex } from '@ds/primitives/Flex';
import { Button } from '@ds/primitives/Button';
import { Text } from '@ds/primitives/Text';
import { SettingsSection } from '@ds/composites/SettingsSection';
import { SitePage } from '../../layout/SitePage/SitePage';
import { AdminUserRow } from './sub-components/AdminUserRow';
import { useAdminQueue } from './behavior/useAdminQueue';
import './Admin.css';

const ANCHORS = [
  { id: 'pending', label: 'Pending' },
  { id: 'members', label: 'Members' },
  { id: 'revoked', label: 'Revoked' },
];

const Admin = () => {
  const { loading, groups, busyId, error, grant, revoke } = useAdminQueue();

  const pendingActions = (row: AdminUser) => (
    <Flex gap="xs">
      <Button variant="primary" size="sm" disabled={busyId === row.user.id} onClick={() => void grant(row.user.id)}>Grant</Button>
      <Button variant="ghost" size="sm" disabled={busyId === row.user.id} onClick={() => void revoke(row.user.id)}>Ignore</Button>
    </Flex>
  );
  const revokeAction = (row: AdminUser) => (
    <Button variant="danger" size="sm" disabled={busyId === row.user.id} onClick={() => void revoke(row.user.id)}>Revoke</Button>
  );
  const grantAction = (row: AdminUser) => (
    <Button variant="primary" size="sm" disabled={busyId === row.user.id} onClick={() => void grant(row.user.id)}>Grant</Button>
  );

  const empty = (text: string) => <Text as="p" variant="caption">{text}</Text>;
  const members = groups.member.length + groups.admin.length;

  return (
    <SitePage section="admin" anchors={ANCHORS}>
      <Stack gap="xl" align="stretch" className="admin">
        {loading && empty('Loading users')}
        {error && <Text as="p" variant="caption" role="alert">{error}</Text>}

        <Box data-section="pending">
          <SettingsSection title="Pending" description={`${groups.pending.length} waiting`}>
            {!loading && groups.pending.length === 0 && empty('Nobody is waiting.')}
            {groups.pending.map((row) => <AdminUserRow key={row.user.id} row={row} action={pendingActions(row)} />)}
          </SettingsSection>
        </Box>

        <Box data-section="members">
          <SettingsSection title="Members" description={members === 1 ? '1 member' : `${members} members`}>
            {groups.admin.map((row) => <AdminUserRow key={row.user.id} row={row} />)}
            {groups.member.map((row) => <AdminUserRow key={row.user.id} row={row} action={revokeAction(row)} />)}
          </SettingsSection>
        </Box>

        <Box data-section="revoked">
          <SettingsSection title="Revoked" description={`${groups.revoked.length} revoked`}>
            {!loading && groups.revoked.length === 0 && empty('Nobody is revoked.')}
            {groups.revoked.map((row) => <AdminUserRow key={row.user.id} row={row} action={grantAction(row)} />)}
          </SettingsSection>
        </Box>
      </Stack>
    </SitePage>
  );
};

export { Admin };
