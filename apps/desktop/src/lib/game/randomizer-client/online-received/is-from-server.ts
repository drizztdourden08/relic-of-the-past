/* @layer bridge-wasm @kind logic */
import { SERVER_SLOT } from './online-received.constants';
import type { ApNetworkItem } from '../ap-protocol.type';

const isFromServer = (item: ApNetworkItem): boolean => item.player === SERVER_SLOT || item.location < 0;

export { isFromServer };
