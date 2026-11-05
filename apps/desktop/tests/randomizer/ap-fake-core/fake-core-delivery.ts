/* @layer tests @kind helper */
import type { FakeCore } from './ap-fake-core.type';

type FakeCoreDelivery = Pick<FakeCore, 'deliver' | 'cancelDeliveries' | 'grantNext' | 'becomeReady'>;

const fakeCoreDelivery = (self: () => FakeCore): FakeCoreDelivery => ({
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
  becomeReady: () => {
    const core = self();
    core.notReady.clear();
    const listeners = [...core.readyListeners];
    core.readyListeners.clear();
    for (const listener of listeners) listener();
  },
});

export { fakeCoreDelivery };
