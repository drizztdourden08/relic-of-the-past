/* @layer tests @kind helper */
import type { LocationKey } from '@rotp/randomizer';
import type { FakeCore } from './ap-fake-core.type';

type FakeCoreDelivery = Pick<FakeCore,
  | 'arm' | 'disarm' | 'buildScoutPlan' | 'armScouted' | 'deliver' | 'cancelDeliveries' | 'grantNext'
  | 'onDeliveryReady' | 'becomeReady'>;

const fakeCoreDelivery = (self: () => FakeCore): FakeCoreDelivery => ({
  arm: () => Promise.resolve(undefined),
  disarm: () => { self().disarms += 1; },
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
  armScouted: ({ scouts, maps }) => {
    for (const { location } of scouts) {
      if (!self().armedLocations.has(location)) maps.overriddenLocationIds.delete(location);
    }
    return Promise.resolve({ ok: true, placement: null, pollEntries: null });
  },
  deliver: (itemName, sender, onGranted) => {
    const core = self();
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
    self().cancels += 1;
    self().queued = [];
  },
  grantNext: () => self().queued.shift()?.grant(),
  onDeliveryReady: (listener) => {
    self().readyListeners.add(listener);
    return () => self().readyListeners.delete(listener);
  },
  becomeReady: () => {
    const core = self();
    core.notReady.clear();
    const listeners = [...core.readyListeners];
    core.readyListeners.clear();
    for (const listener of listeners) listener();
  },
});

export { fakeCoreDelivery };
