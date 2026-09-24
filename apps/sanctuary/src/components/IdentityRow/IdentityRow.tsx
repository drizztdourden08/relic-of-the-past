/* @layer sanctuary-site @kind component */
/**
 * One sign-in method on the Account page: linked (handle, date, Unlink) or not linked
 * (a Link button). The last linked method cannot be unlinked, so its button is disabled.
 */
import type { Provider } from '@shared/sanctuary/providers';
import { PROVIDER_LABELS } from '@shared/sanctuary/providers';
import type { Identity } from '@shared/sanctuary/types';
import { Button } from '@ds/primitives/Button';
import { Row } from '../Row/Row';
import { ProviderButton } from '../ProviderButton/ProviderButton';
import { formatDay } from '../../lib/format-date';

type IdentityRowProps = {
  provider: Provider;
  identity: Identity | null;
  /** False when this is the only linked method. */
  canUnlink: boolean;
  busy: boolean;
  onUnlink: (provider: Provider) => void;
};

const IdentityRow = (props: IdentityRowProps) => {
  const { provider, identity, canUnlink, busy, onUnlink } = props;
  const label = PROVIDER_LABELS[provider];
  if (!identity) {
    return <Row label={label} value="not linked" action={<ProviderButton provider={provider} intent="link" returnTo="/account" />} />;
  }
  const value = `${identity.handle} · linked ${formatDay(identity.linkedAt)}`;
  const action = (
    <Button variant="ghost" size="sm" disabled={!canUnlink || busy} onClick={() => onUnlink(provider)}>
      Unlink
    </Button>
  );
  return <Row label={label} value={value} action={action} />;
};

export { IdentityRow };
export type { IdentityRowProps };
