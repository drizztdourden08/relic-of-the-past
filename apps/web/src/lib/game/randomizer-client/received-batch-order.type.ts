/* @layer bridge-wasm @kind types */
import type { ApNetworkItem } from './ap-protocol.type';

interface ReceivedEntry {
  item: ApNetworkItem;
  index: number;
}

export type { ReceivedEntry };
