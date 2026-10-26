/* @layer renderer-lib @kind logic */
import type { PatternValue } from '@drizztdourden08/tessera/composites';
import { HOST_NAME, OCTETS } from './lobby-draft.constants';
import { slotText } from './slot-text';

const hostOf = (address: PatternValue): string | null => {
  if (address.kind === 'ip') {
    const octets = OCTETS.map((name) => slotText(address[name]));
    return octets.every((octet) => octet !== '') ? octets.join('.') : null;
  }
  const host = slotText(address.host);
  return HOST_NAME.test(host) ? host : null;
};

const remoteAddressOf = (address: PatternValue): string | null => {
  const host = hostOf(address);
  const port = slotText(address.port);
  return host === null || port === '' ? null : `${host}:${port}`;
};

export { remoteAddressOf };
