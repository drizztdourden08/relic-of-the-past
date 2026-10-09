/* @layer bridge-wasm @kind types */
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import type { RotpSlotData } from '@shared/randomizer/archipelago/slot-data.type';
import type { ApGameData, ApNetworkItem } from './ap-protocol.type';
import type { KillOutcome } from './ap-kill-link';
import type { LinkDiedListener } from './ap-link-died';
import type { ForeignOwners } from './foreign-item-line';
import type { PollEntry } from './location-poller';
import type { ScoutMaps, ScoutPlan } from './online-overrides';
import type { OnlineSessionConfig } from './online-session-config.type';

type DeliveryOutcome = 'delivered' | 'unknown' | 'not-ready';

type CheckReporter = { reportCheck(location: LocationKey): void };

interface ScoutedInput {
  scouts: readonly ApNetworkItem[];
  maps: ScoutMaps;
  slot: number;
  slotData: RotpSlotData | null;
  seedName?: string;
  playerName(slot: number): string;
  itemName(itemId: number, ownerSlot: number): string;
  gameOf(slot: number): string | undefined;
  reporter: CheckReporter;
}

type ScoutedOutcome =
  | { ok: true; placement: Placement | null; foreignOwners?: ForeignOwners; pollEntries: readonly PollEntry[] | null }
  | { ok: false; reason: string };

interface OnlineCore {
  arm(config: OnlineSessionConfig): Promise<void>;
  disarm(): void;
  buildScoutPlan(gameData: ApGameData, maps: ScoutMaps): ScoutPlan;
  armScouted(input: ScoutedInput): Promise<ScoutedOutcome>;
  deliver(itemName: string, senderName: string | null, onGranted: () => void): DeliveryOutcome;
  cancelDeliveries(): void;
  onDeliveryReady(listener: () => void): () => void;
  isFileInPlay(): boolean;
  onSaveSwap(listener: () => void): () => void;
  goalEntry(): PollEntry | null;
  startPolling(
    reporter: CheckReporter, entries: readonly PollEntry[], isKnownReported: (key: LocationKey) => boolean,
  ): void;
  pausePolling(): void;
  readReceivedIndex(): number;
  writeReceivedIndex(index: number): void;
  readRoomHash(): number;
  writeRoomHash(hash: number): void;
  markCollected(keys: readonly LocationKey[]): void;
  setDeathLink(enabled: boolean): void;
  killLink(): KillOutcome;
  onLinkDied(listener: LinkDiedListener): () => void;
}

export type { CheckReporter, DeliveryOutcome, OnlineCore, ScoutedInput, ScoutedOutcome };
