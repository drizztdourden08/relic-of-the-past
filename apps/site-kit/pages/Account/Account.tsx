/* @layer site-kit @kind component */
import { PROVIDERS } from '@shared/hub/providers';
import { Box, Stack, Flex, Button, Text } from '@drizztdourden08/tessera/primitives';
import { SettingsSection } from '@drizztdourden08/tessera/composites';
import { SitePage } from '../../layout/SitePage/SitePage';
import { Row } from '../../components/Row/Row';
import { AccessChip } from '../../components/AccessChip/AccessChip';
import { GroupChips } from '../../components/GroupChips/GroupChips';
import { IdentityRow } from '../../components/IdentityRow/IdentityRow';
import { DeviceRow } from '../../components/DeviceRow/DeviceRow';
import { useSessionContext } from '../../session/session-context';
import { formatDay } from '../../lib/format-date';
import { useAccountActions } from './behavior/useAccountActions';
import { useDevices } from './behavior/useDevices';
import { ANCHORS, SOURCE_LABELS } from './Account.constants';
import './Account.css';

const Account = () => {
  const { me, access, identities, groups } = useSessionContext();
  const actions = useAccountActions();
  const devices = useDevices();
  if (!me || !access) return null;

  const accessValue = `${SOURCE_LABELS[access.source]} · checked ${formatDay(access.checkedAt)}`;
  const recheckButton = <Button variant="ghost" size="sm" disabled={actions.busy} onClick={() => void actions.recheck()}>Re-check</Button>;

  return (
    <SitePage section="account" anchors={ANCHORS}>
      <Stack gap="xl" align="stretch" className="account">
        <Box data-section="name">
          <SettingsSection title="Display name">
            <Text as="p" className="account__name">{me.displayName}</Text>
          </SettingsSection>
        </Box>

        <Box data-section="access">
          <SettingsSection title="Access">
            <Row label={<AccessChip state={access.state} />} value={accessValue} action={recheckButton} />
            <Row
              label="Groups"
              value={<GroupChips groups={groups} manualIds={me.groupIds} roleIds={me.roleGroupIds} />}
            />
          </SettingsSection>
        </Box>

        <Box data-section="sign-in">
          <SettingsSection title="Sign-in methods" description="The last method cannot be unlinked.">
            {PROVIDERS.map((provider) => (
              <IdentityRow
                key={provider}
                provider={provider}
                identity={identities.find((identity) => identity.provider === provider) ?? null}
                canUnlink={identities.length > 1}
                busy={actions.busy}
                onUnlink={(p) => void actions.unlink(p)}
              />
            ))}
          </SettingsSection>
        </Box>

        <Box data-section="devices">
          <SettingsSection title="Signed-in devices" description="The app, on each machine it is signed in on.">
            {devices.devices === null && <Text as="p" variant="caption">Loading devices</Text>}
            {devices.devices?.length === 0 && <Text as="p" variant="caption">No device is signed in.</Text>}
            {devices.devices?.map((device) => (
              <DeviceRow key={device.id} device={device} busy={devices.busy} onRevoke={(id) => void devices.revoke(id)} />
            ))}
            {devices.error && <Text as="p" variant="caption" role="alert">{devices.error}</Text>}
          </SettingsSection>
        </Box>

        <Flex gap="sm" align="center">
          <Button variant="ghost" disabled={actions.busy} onClick={() => void actions.signOutHere()}>Sign out</Button>
          <Button variant="ghost" disabled={actions.busy} onClick={() => void actions.signOutEverywhere()}>Sign out everywhere</Button>
          {actions.error && <Text as="span" variant="caption" role="alert">{actions.error}</Text>}
        </Flex>
      </Stack>
    </SitePage>
  );
};

export { Account };
