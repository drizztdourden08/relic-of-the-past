/* @layer bridge-wasm @kind logic */
import type { ServerAddress } from './server-address.type';

const joinServerAddress = ({ host, port }: ServerAddress): string => `${host.trim()}:${port.trim()}`;

export { joinServerAddress };
