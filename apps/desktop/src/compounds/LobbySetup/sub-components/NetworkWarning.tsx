/* @layer renderer-components @kind component */
import { Button, Callout } from '@drizztdourden08/tessera/primitives';
import { NETWORK_BLOCKED } from '../LobbySetup.constants';
import type { NetworkWarningProps } from '../LobbySetup.type';

const NetworkWarning = ({ onAllow }: NetworkWarningProps) => (
  <Callout
    tone="warning"
    variant="footnote"
    action={<Button size="sm" variant="secondary" onClick={onAllow}>Allow network access</Button>}
  >
    {NETWORK_BLOCKED}
  </Callout>
);

export { NetworkWarning };
