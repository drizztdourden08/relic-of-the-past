/* @layer tests @kind helper */
import type { FakeCore } from './ap-fake-core.type';
import { fakeCoreDelivery } from './fake-core-delivery';
import { fakeCoreHost } from './fake-core-host';
import { fakeCorePlay } from './fake-core-play';
import { fakeCoreState } from './fake-core-state';

const createFakeCore = (): FakeCore => {
  const self = (): FakeCore => core;
  const core = { ...fakeCoreState(), ...fakeCoreDelivery(self), ...fakeCorePlay(self) } as FakeCore;
  core.host = fakeCoreHost(core);
  return core;
};

export { createFakeCore };
