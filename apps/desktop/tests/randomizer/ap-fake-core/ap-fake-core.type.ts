/* @layer tests @kind type */
import type { DeliverResult, OnlineHost, ReceivedPort } from '@drizztdourden08/brock-randomizer/archipelago';

interface Delivery { itemName: string; sender: string | null }

interface FakeCore {
  host: OnlineHost;
  port: ReceivedPort | null;
  report: ((locationId: number) => void) | null;
  delivered: Delivery[];
  queued: (Delivery & { grant: () => void })[];
  holdGrants: boolean;
  index: number;
  roomHash: number;
  inPlay: boolean;
  goal: boolean;
  kills: number;
  down: boolean;
  disarms: number;
  pauses: number;
  cancels: number;
  deathLinkBits: boolean[];
  collected: Set<string>;
  localComplete: Set<string>;
  armedLocations: Set<number>;
  notReady: Set<string>;
  readyListeners: Set<() => void>;
  deliver(itemName: string, sender: string | null, onGranted: () => void): DeliverResult;
  cancelDeliveries(): void;
  isFileInPlay(): boolean;
  onSaveSwap(listener: () => void): () => void;
  readReceivedIndex(): number;
  writeReceivedIndex(index: number): void;
  readRoomHash(): number;
  writeRoomHash(hash: number): void;
  becomeReady(): void;
  grantNext(): void;
  setInPlay(inPlay: boolean): void;
  swapSave(): void;
  die(cause: unknown): void;
}

export type { Delivery, FakeCore };
