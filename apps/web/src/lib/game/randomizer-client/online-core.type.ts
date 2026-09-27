/* @layer bridge-wasm @kind types */
/**
 * Everything the online client asks of the game, behind one seam. The session speaks the
 * protocol; this is the only way it reaches the core, so a test runs the whole client in
 * node against a fake (tests/randomizer/ap-protocol.keep.test.ts) and the app passes the
 * real one (online-core.ts).
 */
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

/** 'not-ready': the game cannot take it now, so the received index must not move past it. */
type DeliveryOutcome = 'delivered' | 'unknown' | 'not-ready';

type CheckReporter = { reportCheck(location: LocationKey): void };

/** The scout answer and what the room says about the slot, for arming the placement. */
interface ScoutedInput {
  scouts: readonly ApNetworkItem[];
  maps: ScoutMaps;
  slot: number;
  slotData: RotpSlotData | null;
  /** The room's seed name, standing in when the slot data names no seed. */
  seedName?: string;
  playerName(slot: number): string;
  /** An item's name in its owner's game (the room's data package). */
  itemName(itemId: number, ownerSlot: number): string;
  /** The game a slot plays, when the room said. */
  gameOf(slot: number): string | undefined;
  reporter: CheckReporter;
}

/**
 * Armed: the placement the scouts became (null when the core keeps none), the player each
 * foreign item belongs to, and the plan's poll entries (null keeps the ones polling already
 * has). Refused: nothing is armed.
 */
type ScoutedOutcome =
  | { ok: true; placement: Placement | null; foreignOwners?: ForeignOwners; pollEntries: readonly PollEntry[] | null }
  | { ok: false; reason: string };

interface OnlineCore {
  /** Session start, before the socket opens: the online gate bits. */
  arm(config: OnlineSessionConfig): Promise<void>;
  /** Session end: every override, gate and table the session armed. */
  disarm(): void;
  buildScoutPlan(gameData: ApGameData, maps: ScoutMaps): ScoutPlan;
  /**
   * The scout answer is in: arm the session exactly as a local seed with the same options
   * would, and leave in `maps.overriddenLocationIds` only the locations granted in-world.
   */
  armScouted(input: ScoutedInput): Promise<ScoutedOutcome>;
  /**
   * Queues one item; |onGranted| runs when the game confirmed the grant, and only then.
   * |senderName| is null when the server itself sent the item.
   */
  deliver(itemName: string, senderName: string | null, onGranted: () => void): DeliveryOutcome;
  /** Withdraws every queued item not granted yet. */
  cancelDeliveries(): void;
  /** One-shot: the game can take items again (running, delivery queue drained). */
  onDeliveryReady(listener: () => void): () => void;
  /** A save file is in play (not the title, file select or the attract demo). */
  isFileInPlay(): boolean;
  /** The save under the game changed: a state load, a file entered, the return to the title. */
  onSaveSwap(listener: () => void): () => void;
  /** The goal's own poll entry, reported under its check key; null when nothing detects it. */
  goalEntry(): PollEntry | null;
  startPolling(
    reporter: CheckReporter, entries: readonly PollEntry[], isKnownReported: (key: LocationKey) => boolean,
  ): void;
  /** Stops the ticks, keeps the armed overrides (a reconnect resumes with them). */
  pausePolling(): void;
  readReceivedIndex(): number;
  writeReceivedIndex(index: number): void;
  /** The room hash the save holds (room-hash.ts); 0 = no room yet. */
  readRoomHash(): number;
  writeRoomHash(hash: number): void;
  /** The room holds these locations of the slot as checked: show them done, never report them. */
  markCollected(keys: readonly LocationKey[]): void;
  /** The DeathLink gate bit, when the slot data decides differently from the profile. */
  setDeathLink(enabled: boolean): void;
  /** 'armed' when the kill will land, 'down' when Link is already dying, 'unsupported' with no export. */
  killLink(): KillOutcome;
  onLinkDied(listener: LinkDiedListener): () => void;
}

export type { CheckReporter, DeliveryOutcome, OnlineCore, ScoutedInput, ScoutedOutcome };
