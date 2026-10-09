/* @layer bridge-wasm @kind types */
import type { RotpSlotData } from '../archipelago/slot-data.type';
import type { Placement } from '../world/fill/placement.type';
import type { ApNetworkItem, ApNetworkPlayer } from './ap-protocol.type';
import type { ForeignOwners } from './foreign-item-line';
import type { MessageListener, RoomMessage } from './message-log';
import type { NetworkStatus, NetworkStatusListener } from './network-status.type';
import type { RandomizerSession, SessionStatusListener } from './session.type';

interface OnlineSession extends RandomizerSession {
  readonly kind: 'online';
  readonly slotData: RotpSlotData | null;
  readonly team: number | null;
  readonly slot: number | null;
  readonly players: readonly ApNetworkPlayer[];
  readonly checkedLocations: ReadonlySet<number>;
  readonly missingLocations: ReadonlySet<number>;
  readonly messages: readonly RoomMessage[];
  onMessages(listener: MessageListener): () => void;
  senderNameOf(item: ApNetworkItem): string;
  say(text: string): void;
  readonly placement: Placement | null;
  onPlacement(listener: (placement: Placement, foreignOwners: ForeignOwners) => void): () => void;
  onStatusChange(listener: SessionStatusListener): () => void;
  readonly networkStatus: NetworkStatus;
  onNetworkStatus(listener: NetworkStatusListener): () => void;
}

export type { OnlineSession };
