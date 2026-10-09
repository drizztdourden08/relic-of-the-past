/* @layer store-site @kind component */
import { useCallback, useState } from 'react';
import { Button, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { SiteFrame, Gate, useSessionContext } from '@rotp/design';
import { recheckAccess, errorMessage } from '@rotp/hub-client';

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
