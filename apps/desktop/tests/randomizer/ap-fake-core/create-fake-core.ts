/* @layer tests @kind helper */
import type { FakeCore } from './ap-fake-core.type';
import { fakeCoreDelivery } from './fake-core-delivery';
import { fakeCorePlay } from './fake-core-play';
import { fakeCoreState } from './fake-core-state';

const createFakeCore = (): FakeCore => {
  const self = (): FakeCore => core;
  const core: FakeCore = { ...fakeCoreState(), ...fakeCoreDelivery(self), ...fakeCorePlay(self) };
  return core;
};

export { createFakeCore };
