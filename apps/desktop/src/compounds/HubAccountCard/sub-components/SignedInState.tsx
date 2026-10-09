/* @layer renderer-components @kind component */
import { Status, Button, Flex, Image, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { PROVIDER_LABELS } from '@rotp/hub-contracts';
import type { SignedInStateProps } from '../HubAccountCard.type';
import { ACCESS_VARIANT } from './SignedInState.constants';

const SignedInState = (props: SignedInStateProps) => {
  const { me, openSiteLabel, onOpenSite, onSignOut } = props;
  const { user, identities, deviceLabel } = me;
  const linked = identities.map((identity) => PROVIDER_LABELS[identity.provider]).join(', ');
  const initial = user.displayName.slice(0, 1).toUpperCase();
  const avatarFallback = <Text as="span" className="hub-account__avatar hub-account__avatar--initial">{initial}</Text>;

  return (
    <Flex align="center" justify="between" gap="md" className="hub-account">
      <Flex align="center" gap="md">
        {user.avatarUrl
          ? <Image src={user.avatarUrl} alt="" className="hub-account__avatar" fallback={avatarFallback} />
          : avatarFallback}
        <Stack gap="xs">
          <Flex align="center" gap="sm">
            <Text as="span" className="hub-account__name">{user.displayName}</Text>
            {user.access && <Status tone={ACCESS_VARIANT[user.access.state]}>{user.access.state}</Status>}
          </Flex>
          <Text as="p" className="hub-account__detail">
            {linked ? `${linked} linked` : 'No sign-in method linked'} · this device: {deviceLabel}
          </Text>
        </Stack>
      </Flex>
      <Flex gap="sm">
        <Button variant="secondary" onClick={onOpenSite}>{openSiteLabel}</Button>
        <Button variant="tertiary" onClick={onSignOut}>Sign out</Button>
      </Flex>
    </Flex>
  );
};

export { SignedInState };
