/* @layer bridge-wasm @kind logic */
import type { StartedRoom } from '@rotp/randomizer';

const withScheme = (address: string, tls: StartedRoom['tls']): string => {
  if (tls === 'yes') return `wss://${address}`;
  return tls === 'no' ? `ws://${address}` : address;
};

export { withScheme };
