/* @layer renderer-components @kind component */
import { Badge, Button, Flex, Image, Stack, Text } from '@ds/primitives';
import { PROVIDER_LABELS } from '@shared/sanctuary';
import type { AccessState } from '@shared/sanctuary';
import type { BadgeVariant } from '@ds/primitives/Badge/Badge.type';
import type { SignedInStateProps } from '../SanctuaryAccountCard.type';

const ACCESS_VARIANT: Record<AccessState, BadgeVariant> = {
  admin: 'success',
  member: 'success',
  pending: 'warning',
  revoked: 'danger',
};

const SignedInState = (props: SignedInStateProps) => {
  const { me, onOpenSite, onSignOut } = props;
  const { user, identities, deviceLabel } = me;
  const linked = identities.map((identity) => PROVIDER_LABELS[identity.provider]).join(', ');
  const initial = user.displayName.slice(0, 1).toUpperCase();
  const avatarFallback = <Text as="span" className="sanctuary-account__avatar sanctuary-account__avatar--initial">{initial}</Text>;

  return (
    <Flex align="center" justify="between" gap="md" className="sanctuary-account">
      <Flex align="center" gap="md">
        {user.avatarUrl
          ? <Image src={user.avatarUrl} alt="" className="sanctuary-account__avatar" fallback={avatarFallback} />
          : avatarFallback}
        <Stack gap="xs">
          <Flex align="center" gap="sm">
            <Text as="span" className="sanctuary-account__name">{user.displayName}</Text>
            <Badge variant={ACCESS_VARIANT[user.access.state]}>{user.access.state}</Badge>
          </Flex>
          <Text as="p" className="sanctuary-account__detail">
            {linked ? `${linked} linked` : 'No sign-in method linked'} · this device: {deviceLabel}
          </Text>
        </Stack>
      </Flex>
      <Flex gap="sm">
        <Button variant="secondary" onClick={onOpenSite}>Open Sanctuary</Button>
        <Button variant="tertiary" onClick={onSignOut}>Sign out</Button>
      </Flex>
    </Flex>
  );
};

export { SignedInState };
