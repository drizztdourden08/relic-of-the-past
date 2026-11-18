/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Button, Callout } from '@drizztdourden08/tessera/primitives';
import { NETWORK_BLOCKED } from '../LobbySetup.constants';
import type { NetworkWarningProps } from '../LobbySetup.type';

const NetworkWarning = ({ onAllow }: NetworkWarningProps) => {
  const t = useT();
  return (
  <Callout
    tone="warning"
    variant="footnote"
    action={<Button size="sm" variant="secondary" onClick={onAllow}>{t('compounds:lobby-setup.allow-network-access')}</Button>}
  >
    {NETWORK_BLOCKED}
  </Callout>
  );
};

export { NetworkWarning };
