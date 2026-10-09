/* @layer tests @kind helper */
import { rebaselineEntries } from '@app/lib/game/randomizer-client/poll-rebaseline';
import { deathOf } from '@app/lib/game/randomizer-client/ap-link-died';
import type { LinkDiedListener } from '@app/lib/game/randomizer-client/ap-link-died';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { FakeCore } from './ap-fake-core.type';

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
