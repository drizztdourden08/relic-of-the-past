/* @layer tests @kind type */
import type { CheckReporter, OnlineCore } from '@app/lib/game/randomizer-client/online-core.type';

interface Delivery { itemName: string; sender: string | null }

interface FakeCore extends OnlineCore {
  delivered: Delivery[];
  queued: (Delivery & { grant: () => void })[];
  holdGrants: boolean;
  index: number;
  roomHash: number;
  inPlay: boolean;
  kills: number;
  down: boolean;
  disarms: number;
  pauses: number;
  cancels: number;
  deathLinkBits: boolean[];
  collected: Set<string>;
  localComplete: Set<string>;
  armedLocations: Set<number>;
  reporter: CheckReporter | null;
  notReady: Set<string>;
  readyListeners: Set<() => void>;
  becomeReady(): void;
  grantNext(): void;
  setInPlay(inPlay: boolean): void;
  swapSave(): void;
  die(cause: unknown): void;
}

export type { Delivery, FakeCore };
