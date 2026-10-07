/* @layer store-site @kind component */
/**
 * What a signed-in person sees when the store has no player record for them: barred from the
 * Hookshop by an admin, or signed in before the store knew them. The store is open, so
 * there is no queue to wait in; a re-check covers the second case.
 */
import { useCallback, useState } from 'react';
import { Button } from '@ds/primitives/Button';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import { SiteFrame } from '@site-kit/layout/SiteFrame/SiteFrame';
import { Gate } from '@site-kit/components/Gate/Gate';
import { useSessionContext } from '@site-kit/session/session-context';
import { recheckAccess } from '@site-kit/api/hub-endpoints';
import { errorMessage } from '@site-kit/api/api-error';

const Barred = () => {
  const { access, refresh, signOut } = useSessionContext();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const revoked = access?.state === 'revoked';

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

  const lead = revoked
    ? 'An admin closed this account on the Hookshop. Your items are no longer listed.'
    : 'The Hookshop has not set up your account yet.';

  return (
    <SiteFrame bare>
      <Gate title={revoked ? 'Account closed' : 'Almost there'} lead={lead}>
        <Stack gap="sm" align="stretch">
          {!revoked && <Button variant="primary" disabled={busy} onClick={() => void handleRecheck()}>Try again</Button>}
          <Button variant="ghost" onClick={() => void signOut()}>Sign out</Button>
          {error && <Text as="p" variant="caption" role="alert">{error}</Text>}
        </Stack>
      </Gate>
    </SiteFrame>
  );
};

export { Barred };
