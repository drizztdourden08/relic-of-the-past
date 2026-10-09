/* @layer site-kit @kind component */
import { PROVIDER_LABELS } from '@shared/hub/providers';
import { Button } from '@drizztdourden08/tessera/primitives';
import { Row } from '../Row/Row';
import { ProviderButton } from '../ProviderButton/ProviderButton';
import { formatDay } from '../../lib/format-date';
import type { IdentityRowProps } from './IdentityRow.type';

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
