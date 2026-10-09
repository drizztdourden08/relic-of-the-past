/* @layer bridge-wasm @kind logic */
import { MAX_PORT, PORT_DIGITS } from './server-address.constants';
import type { ServerAddress } from './server-address.type';

const serverAddressError = ({ host, port }: ServerAddress): string | null => {
  if (host.trim() === '') return 'Enter a host.';
  const value = Number(port.trim());
  if (!PORT_DIGITS.test(port.trim()) || value < 1 || value > MAX_PORT) return `Port is 1 to ${MAX_PORT}.`;
  return null;
};

export { serverAddressError };
