/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Button, Callout } from '@drizztdourden08/tessera/primitives';
import type { NetworkWarningProps } from '../LobbySetup.type';

const NetworkWarning = ({ onAllow }: NetworkWarningProps) => {
  const t = useT();
  return (
    <Callout
      tone="warning"
      variant="footnote"
      action={<Button size="sm" variant="secondary" onClick={onAllow}>{t('compounds:lobby-setup.allow-network-access')}</Button>}
    >
      {t('compounds:lobby-setup.network-blocked')}
    </Callout>
  );
};

export { NetworkWarning };
