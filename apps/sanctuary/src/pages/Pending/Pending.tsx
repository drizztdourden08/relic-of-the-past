/* @layer sanctuary-site @kind component */
import { useCallback, useState } from 'react';
import { PROVIDER_LABELS } from '@rotp/hub-contracts';
import { Stack, Button, Pressable, Text } from '@drizztdourden08/tessera/primitives';
import { SiteFrame } from '@site-kit/layout/SiteFrame/SiteFrame';
import { Gate } from '@site-kit/components/Gate/Gate';
import { ProviderButton } from '@site-kit/components/ProviderButton/ProviderButton';
import { useSessionContext } from '@site-kit/session/session-context';
import { recheckAccess } from '@site-kit/api/hub-endpoints';
import { errorMessage } from '@site-kit/api/api-error';
import './Pending.css';

const Pending = () => {
  const { access, identities, refresh, signOut } = useSessionContext();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasDiscord = identities.some((identity) => identity.provider === 'discord');
  const signedInWith = identities.map((identity) => PROVIDER_LABELS[identity.provider]).join(', ');

  const handleRecheck = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      await recheckAccess();
      await refresh();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }, [refresh]);

  const title = access?.state === 'revoked' ? 'Access revoked' : 'Waiting for access';
  const footnote = (
    <>
      signed in with {signedInWith} {'·'}{' '}
      <Pressable className="pending__signout" onClick={() => void signOut()}>sign out</Pressable>
    </>
  );

  return (
    <SiteFrame bare>
      <Gate
        title={title}
        lead="Have the contributor role on Discord? Link your Discord account and access is immediate. Otherwise an admin will approve you here."
        footnote={footnote}
      >
        <Stack gap="sm" align="stretch">
          {!hasDiscord && <ProviderButton provider="discord" intent="link" returnTo="/" fullWidth />}
          <Button variant="ghost" disabled={busy} onClick={() => void handleRecheck()}>Re-check access</Button>
          {error && <Text as="p" variant="caption" role="alert">{error}</Text>}
        </Stack>
      </Gate>
    </SiteFrame>
  );
};

export { Pending };
