/* @layer bridge-wasm @kind types */
/** The online session's surface: the shared session contract plus what the room told it. */
import type { RotpSlotData } from '@shared/randomizer/archipelago/slot-data.type';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import type { ApNetworkItem, ApNetworkPlayer } from './ap-protocol.type';
import type { ForeignOwners } from './foreign-item-line';
import type { MessageListener, RoomMessage } from './message-log';
import type { NetworkStatus, NetworkStatusListener } from './network-status.type';
import type { RandomizerSession, SessionStatusListener } from './session.type';

interface OnlineSession extends RandomizerSession {
  readonly kind: 'online';
  /** The world's slot data, checked (parse-slot-data.ts); null until connected or when malformed. */
  readonly slotData: RotpSlotData | null;
  readonly team: number | null;
  readonly slot: number | null;
  readonly players: readonly ApNetworkPlayer[];
  readonly checkedLocations: ReadonlySet<number>;
  readonly missingLocations: ReadonlySet<number>;
  /** The room's messages, newest last (the last 200). */
  readonly messages: readonly RoomMessage[];
  onMessages(listener: MessageListener): () => void;
  /** The name of the player an item came from ("Server" for slot 0). */
  senderNameOf(item: ApNetworkItem): string;
  /** Chat into the room. */
  say(text: string): void;
  /** The placement the scouts became; null until they are armed. */
  readonly placement: Placement | null;
  /** The placement once armed, with the player each foreign item belongs to. */
  onPlacement(listener: (placement: Placement, foreignOwners: ForeignOwners) => void): () => void;
  onStatusChange(listener: SessionStatusListener): () => void;
  /** Connection, health, players, server and progress, built fresh on each read. */
  readonly networkStatus: NetworkStatus;
  /** Every packet in or out, every ping echo and every state change. */
  onNetworkStatus(listener: NetworkStatusListener): () => void;
}

export type { OnlineSession };
