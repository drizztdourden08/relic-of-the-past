/* @layer tests @kind helper */
import type { FakeCore } from './ap-fake-core.type';

type FakeCoreState = Pick<FakeCore,
  | 'delivered' | 'queued' | 'holdGrants' | 'index' | 'roomHash' | 'inPlay' | 'kills' | 'down' | 'disarms' | 'pauses'
  | 'cancels' | 'deathLinkBits' | 'collected' | 'localComplete' | 'armedLocations' | 'reporter' | 'notReady'
  | 'readyListeners'>;

const fakeCoreState = (): FakeCoreState => ({
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
});

export { fakeCoreState };
