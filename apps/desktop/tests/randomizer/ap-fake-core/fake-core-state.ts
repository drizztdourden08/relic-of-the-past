/* @layer tests @kind helper */
import type { FakeCore } from './ap-fake-core.type';

type FakeCoreState = Pick<FakeCore,
  | 'port' | 'report' | 'delivered' | 'queued' | 'holdGrants' | 'index' | 'roomHash' | 'inPlay' | 'goal' | 'kills'
  | 'down' | 'disarms' | 'pauses' | 'cancels' | 'deathLinkBits' | 'collected' | 'localComplete' | 'armedLocations'
  | 'notReady' | 'readyListeners'>;

const fakeCoreState = (): FakeCoreState => ({
  port: null,
  report: null,
  delivered: [],
  queued: [],
  holdGrants: false,
  index: 0,
  roomHash: 0,
  inPlay: true,
  goal: false,
  kills: 0,
  down: false,
  disarms: 0,
  pauses: 0,
  cancels: 0,
  deathLinkBits: [],
  collected: new Set(),
  localComplete: new Set(),
  armedLocations: new Set(),
  notReady: new Set(),
  readyListeners: new Set(),
});

export { fakeCoreState };
