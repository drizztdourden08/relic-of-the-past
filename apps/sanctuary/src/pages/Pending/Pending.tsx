/* @layer sanctuary-site @kind component */
import { PROVIDER_LABELS } from '@rotp/hub-contracts';
import { Stack, Button, Pressable, Text } from '@drizztdourden08/tessera/primitives';
import { Gate, ProviderButton, useRecheckAccess, useSessionContext } from '@rotp/design';
import './Pending.css';

const Pending = () => {
  const { access, identities, signOut } = useSessionContext();
  const { busy, error, recheck } = useRecheckAccess();
  const hasDiscord = identities.some((identity) => identity.provider === 'discord');
  const signedInWith = identities.map((identity) => PROVIDER_LABELS[identity.provider]).join(', ');

  const title = access?.state === 'revoked' ? 'Access revoked' : 'Waiting for access';
  const footnote = (
    <>
      signed in with {signedInWith} {'·'}{' '}
      <Pressable className="pending__signout" onClick={() => void signOut()}>sign out</Pressable>
    </>
  );

  return (
    <Gate
      title={title}
      lead="Have the contributor role on Discord? Link your Discord account and access is immediate. Otherwise an admin will approve you here."
      footnote={footnote}
    >
      <Stack gap="sm" align="stretch">
        {!hasDiscord && <ProviderButton provider="discord" intent="link" returnTo="/" fullWidth />}
        <Button variant="ghost" disabled={busy} onClick={() => void recheck()}>Re-check access</Button>
        {error && <Text as="p" variant="caption" role="alert">{error}</Text>}
      </Stack>
    </Gate>
  );
};

export { Pending };
