/* @layer site-kit @kind component */
import { useCallback } from 'react';
import type { ChangeEvent } from 'react';
import { Stack, Button, Text, TextInput } from '@drizztdourden08/tessera/primitives';
import { SiteFrame } from '../../layout/SiteFrame/SiteFrame';
import { Gate } from '../../components/Gate/Gate';
import { useDeviceConfirm } from './behavior/useDeviceConfirm';
import type { DeviceProps } from './Device.type';
import './Device.css';

const Device = (props: DeviceProps) => {
  const { code: initialCode } = props;
  const { code, setCode, busy, error, confirmed, confirm } = useDeviceConfirm(initialCode);
  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => setCode(event.target.value), [setCode]);

  if (confirmed) {
    return (
      <SiteFrame bare>
        <Gate title="Device signed in" lead={`${confirmed.label} is signed in. You can close this tab; the app picks it up on its own.`} />
      </SiteFrame>
    );
  }

  return (
    <SiteFrame bare>
      <Gate
        title="Confirm this device"
        lead="The app showed this code. Confirm it here and the app is signed in as you."
        footnote="a code is valid for ten minutes and works once"
      >
        <Stack gap="sm" align="stretch">
          <TextInput
            className="device__code"
            value={code}
            onChange={handleChange}
            spellCheck={false}
            autoCapitalize="characters"
            aria-label="Device code"
            placeholder="XXXX-XXXX"
          />
          <Button variant="primary" disabled={busy || code.trim().length === 0} onClick={() => void confirm()}>
            Confirm this device
          </Button>
          {error && <Text as="p" variant="caption" role="alert">{error}</Text>}
        </Stack>
      </Gate>
    </SiteFrame>
  );
};

export { Device };
export type { DeviceProps } from './Device.type';
