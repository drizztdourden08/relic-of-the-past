/* @layer renderer-components @kind component */
import { DynamicInput } from '@drizztdourden08/tessera/composites';
import { ADDRESS_LISTS, ADDRESS_SLOTS, HOST_PATTERN, IP_PATTERN } from '../LobbySetup.constants';
import type { RemoteAddressProps } from '../LobbySetup.type';

const RemoteAddress = ({ value, onChange, invalid, disabled }: RemoteAddressProps) => (
  <DynamicInput
    className="lobby-setup__address"
    pattern={value.kind === 'ip' ? IP_PATTERN : HOST_PATTERN}
    lists={ADDRESS_LISTS}
    slots={ADDRESS_SLOTS}
    value={value}
    onChange={onChange}
    invalid={invalid}
    disabled={disabled}
    aria-label="Server address"
  />
);

export { RemoteAddress };
