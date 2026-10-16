/* @layer site-kit @kind component */
import { PROVIDER_LABELS } from '@rotp/hub-contracts';
import { Button, formatDate } from '@drizztdourden08/tessera/primitives';
import { ListItemRow } from '@drizztdourden08/tessera/composites';
import { ProviderButton } from '../ProviderButton/ProviderButton';
import type { IdentityRowProps } from './IdentityRow.type';

const IdentityRow = (props: IdentityRowProps) => {
  const { provider, identity, canUnlink, busy, onUnlink } = props;
  const label = PROVIDER_LABELS[provider];
  if (!identity) {
    const link = <ProviderButton provider={provider} intent="link" returnTo="/account" />;
    return <ListItemRow name={label} columns={[{ primary: 'not linked' }]} action={link} actionVisibility="always" />;
  }
  const value = `${identity.handle} · linked ${formatDate(identity.linkedAt, 'iso', { length: 'short' })}`;
  const action = (
    <Button variant="ghost" size="sm" disabled={!canUnlink || busy} onClick={() => onUnlink(provider)}>
      Unlink
    </Button>
  );
  return <ListItemRow name={label} columns={[{ primary: value }]} action={action} actionVisibility="always" />;
};

export { IdentityRow };
