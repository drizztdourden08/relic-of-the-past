/* @layer renderer-components @kind component */
import { useT, useText } from '@drizztdourden08/brock-react';
import { DynamicInput } from '@drizztdourden08/tessera/composites';
import { HOST_PATTERN, IP_PATTERN, addressLists, addressSlots } from '../LobbySetup.constants';
import type { RemoteAddressProps } from '../LobbySetup.type';

const RemoteAddress = ({ value, onChange, disabled }: RemoteAddressProps) => {
  const t = useT();
  const text = useText();
  return (
    <DynamicInput
      className="lobby-setup__address"
      pattern={value.kind === 'ip' ? IP_PATTERN : HOST_PATTERN}
      lists={addressLists(text)}
      slots={addressSlots(text)}
      value={value}
      onChange={onChange}
      disabled={disabled}
      aria-label={t('compounds:lobby-setup.server-address')}
    />
  );
};

export { RemoteAddress };
