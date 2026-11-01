/* @layer store-site @kind component */
import { Button, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { Gate, useRecheckAccess, useSessionContext } from '@rotp/design';

const Barred = () => {
  const { access, signOut } = useSessionContext();
  const { busy, error, recheck } = useRecheckAccess();
  const revoked = access?.state === 'revoked';

  const lead = revoked
    ? 'An admin closed this account on the Hookshop. Your items are no longer listed.'
    : 'The Hookshop has not set up your account yet.';

  return (
    <Gate title={revoked ? 'Account closed' : 'Almost there'} lead={lead}>
      <Stack gap="sm" align="stretch">
        {!revoked && <Button variant="primary" disabled={busy} onClick={() => void recheck()}>Try again</Button>}
        <Button variant="ghost" onClick={() => void signOut()}>Sign out</Button>
        {error && <Text as="p" variant="caption" role="alert">{error}</Text>}
      </Stack>
    </Gate>
  );
};

export { Barred };
