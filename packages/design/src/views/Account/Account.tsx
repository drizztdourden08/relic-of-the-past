/* @layer site-kit @kind component */
import { PROVIDERS } from '@rotp/hub-contracts';
import { Box, Stack, Flex, Button, Text } from '@drizztdourden08/tessera/primitives';
import { ListItemList, ListItemRow, SettingsPage, SettingsSection } from '@drizztdourden08/tessera/composites';
import { useSectionHeading } from '../../hooks/useSectionHeading/useSectionHeading';
import { AccessChip } from '../../compounds/AccessChip/AccessChip';
import { GroupChips } from '../../compounds/GroupChips/GroupChips';
import { IdentityRow } from '../../compounds/IdentityRow/IdentityRow';
import { useSessionContext } from '../../session/session-context';
import { formatDay } from '@rotp/hub-client';
import { useAccountActions } from './behavior/useAccountActions';
import { DevicesSection } from './sub-components/DevicesSection';
import { ANCHORS, SOURCE_LABELS } from './Account.constants';
import './Account.css';

const Account = () => {
  const { me, access, identities, groups } = useSessionContext();
  const actions = useAccountActions();
  const heading = useSectionHeading('account');
  if (!me || !access) return null;

  const accessValue = `${SOURCE_LABELS[access.source]} · checked ${formatDay(access.checkedAt)}`;
  const recheckButton = <Button variant="ghost" size="sm" disabled={actions.busy} onClick={() => void actions.recheck()}>Re-check</Button>;

  return (
    <SettingsPage icon={heading.icon} title={heading.title} anchors={ANCHORS}>
      <Stack gap="xl" align="stretch" className="account">
        <Box data-section="name">
          <SettingsSection title="Display name">
            <Text as="p" className="account__name">{me.displayName}</Text>
          </SettingsSection>
        </Box>

        <Box data-section="access">
          <SettingsSection title="Access">
            <ListItemList label="Access">
              <ListItemRow name={<AccessChip state={access.state} />} columns={[{ primary: accessValue }]} action={recheckButton} actionVisibility="always" />
              <ListItemRow name="Groups" columns={[{ primary: <GroupChips groups={groups} manualIds={me.groupIds} roleIds={me.roleGroupIds} /> }]} />
            </ListItemList>
          </SettingsSection>
        </Box>

        <Box data-section="sign-in">
          <SettingsSection title="Sign-in methods" description="The last method cannot be unlinked.">
            <ListItemList label="Sign-in methods">
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
            </ListItemList>
          </SettingsSection>
        </Box>

        <Box data-section="devices">
          <DevicesSection />
        </Box>

        <Flex gap="sm" align="center">
          <Button variant="ghost" disabled={actions.busy} onClick={() => void actions.signOutHere()}>Sign out</Button>
          <Button variant="ghost" disabled={actions.busy} onClick={() => void actions.signOutEverywhere()}>Sign out everywhere</Button>
          {actions.error && <Text as="span" variant="caption" role="alert">{actions.error}</Text>}
        </Flex>
      </Stack>
    </SettingsPage>
  );
};

export { Account };
