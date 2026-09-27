/* @layer tests @kind helper */
/**
 * The game side of the protocol test: an OnlineCore that records what the client asked of
 * it. Its poller runs the real baseline decision (poll-rebaseline.ts) once, as the first
 * tick would, over a set of checks the test declares complete in the save.
 *
 * A queued item is granted at once, as a game that can take it does, unless `holdGrants` is
 * set: then it waits in `queued` until grantNext(), the way the delivery queue holds it until
 * the player can receive. `delivered` lists only the granted items. A save swap (setInPlay,
 * swapSave) fires the client's onSaveSwap listener, as a state load or a file entered does.
 */
import { rebaselineEntries } from '@app/lib/game/randomizer-client/poll-rebaseline';
import { deathOf } from '@app/lib/game/randomizer-client/ap-link-died';
import type { LinkDiedListener } from '@app/lib/game/randomizer-client/ap-link-died';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { CheckReporter, OnlineCore } from '@app/lib/game/randomizer-client/online-core.type';

/** |sender| is null for an item the server itself sent. */
interface Delivery { itemName: string; sender: string | null }

interface FakeCore extends OnlineCore {
  delivered: Delivery[];
  /** Queued and not granted yet (holdGrants only). */
  queued: (Delivery & { grant: () => void })[];
  holdGrants: boolean;
  index: number;
  roomHash: number;
  inPlay: boolean;
  kills: number;
  /** Link is already dying: a kill answers 'down' and is not counted. */
  down: boolean;
  disarms: number;
  pauses: number;
  cancels: number;
  /** Every DeathLink gate change, in order. */
  deathLinkBits: boolean[];
  /** Keys the room holds as checked (markCollected). */
  collected: Set<string>;
  /** Checks the save shows complete, read by the first poll tick. */
  localComplete: Set<string>;
  /** Locations whose scout answer arms an in-world override. */
  armedLocations: Set<number>;
  reporter: CheckReporter | null;
  /** Item names the game cannot take right now ('not-ready'), until becomeReady(). */
  notReady: Set<string>;
  readyListeners: Set<() => void>;
  /** The game can take items again: every waiting listener runs once. */
  becomeReady(): void;
  /** The item at the front of the queue reaches the player. */
  grantNext(): void;
  /** A file entered or left: in play or not, and the save swap it is. */
  setInPlay(inPlay: boolean): void;
  /** A save state loaded. */
  swapSave(): void;
  /** Link dies, with the cause argument the core passes (a number from the real core). */
  die(cause: unknown): void;
}

const createFakeCore = (): FakeCore => {
  let deathListener: LinkDiedListener | null = null;
  const swapListeners = new Set<() => void>();
  const swap = (): void => { for (const listener of [...swapListeners]) listener(); };
  const core: FakeCore = {
    delivered: [],
    queued: [],
    holdGrants: false,
    index: 0,
    roomHash: 0,
    inPlay: true,
    kills: 0,
    down: false,
    disarms: 0,
    pauses: 0,
    cancels: 0,
    deathLinkBits: [],
    collected: new Set(),
    localComplete: new Set(),
    armedLocations: new Set(),
    reporter: null,
    notReady: new Set(),
    readyListeners: new Set(),
    arm: async () => undefined,
    disarm: () => { core.disarms += 1; },
    buildScoutPlan: (gameData, maps) => {
      const locationIds: number[] = [];
      const pollEntries = [];
      for (const [name, id] of Object.entries(gameData.location_name_to_id)) {
        const key = name as LocationKey;
        maps.keyByLocationId.set(id, key);
        maps.locationIdByKey.set(key, id);
        maps.overriddenLocationIds.add(id);
        locationIds.push(id);
        pollEntries.push({ key });
      }
      return { locationIds, pollEntries };
    },
    armScouted: async ({ scouts, maps }) => {
      for (const { location } of scouts) {
        if (!core.armedLocations.has(location)) maps.overriddenLocationIds.delete(location);
      }
      return { ok: true, placement: null, pollEntries: null };
    },
    deliver: (itemName, sender, onGranted) => {
      if (core.notReady.has(itemName)) return 'not-ready';
      const grant = (): void => {
        core.delivered.push({ itemName, sender });
        onGranted();
      };
      if (core.holdGrants) core.queued.push({ itemName, sender, grant });
      else grant();
      return 'delivered';
    },
    cancelDeliveries: () => {
      core.cancels += 1;
      core.queued = [];
    },
    grantNext: () => core.queued.shift()?.grant(),
    onDeliveryReady: (listener) => {
      core.readyListeners.add(listener);
      return () => core.readyListeners.delete(listener);
    },
    becomeReady: () => {
      core.notReady.clear();
      const listeners = [...core.readyListeners];
      core.readyListeners.clear();
      for (const listener of listeners) listener();
    },
    isFileInPlay: () => core.inPlay,
    onSaveSwap: (listener) => {
      swapListeners.add(listener);
      return () => swapListeners.delete(listener);
    },
    setInPlay: (inPlay) => {
      core.inPlay = inPlay;
      swap();
    },
    swapSave: swap,
    goalEntry: () => ({ key: 'check-351' }),
    startPolling: (reporter, entries, isKnownReported) => {
      core.reporter = reporter;
      const { toReport } = rebaselineEntries({
        entries, isKnownReported, suppressed: new Set(core.collected), isComplete: (entry) => core.localComplete.has(entry.key),
      });
      for (const key of toReport) reporter.reportCheck(key);
    },
    pausePolling: () => { core.pauses += 1; },
    readReceivedIndex: () => core.index,
    writeReceivedIndex: (index) => { core.index = index; },
    readRoomHash: () => core.roomHash,
    writeRoomHash: (hash) => { core.roomHash = hash; },
    markCollected: (keys) => { for (const key of keys) core.collected.add(key); },
    setDeathLink: (enabled) => { core.deathLinkBits.push(enabled); },
    killLink: () => {
      if (core.down) return 'down';
      core.kills += 1;
      return 'armed';
    },
    onLinkDied: (listener) => {
      deathListener = listener;
      return () => { deathListener = null; };
    },
    die: (cause) => deathListener?.(deathOf(cause)),
  };
  return core;
};

export { createFakeCore };
export type { FakeCore };
