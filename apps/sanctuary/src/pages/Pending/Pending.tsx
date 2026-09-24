/* @layer sanctuary-site @kind component */
/**
 * The waiting page a signed-in user sees while no access rule matches them (pending) or
 * after an admin revoked them. Linking Discord is the self-serve way in.
 */
import { useCallback, useState } from 'react';
import { PROVIDER_LABELS } from '@shared/sanctuary/providers';
import { Stack } from '@ds/primitives/Stack';
import { Button } from '@ds/primitives/Button';
import { Text } from '@ds/primitives/Text';
import { SiteFrame } from '../../layout/SiteFrame/SiteFrame';
import { Gate } from '../../components/Gate/Gate';
import { ProviderButton } from '../../components/ProviderButton/ProviderButton';
import { useSessionContext } from '../../session/session-context';
import { recheckAccess } from '../../api/endpoints';
import { errorMessage } from '../../api/client';
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
      <Button variant="bare" className="pending__signout" onClick={() => void signOut()}>sign out</Button>
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
