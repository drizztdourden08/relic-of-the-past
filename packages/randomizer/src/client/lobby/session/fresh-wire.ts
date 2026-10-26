/* @layer bridge-wasm @kind logic */
import { DEFAULT_LIMITS } from '@drizztdourden08/archipelia-lobby-protocol';
import type { WireState } from './session-context.type';

const freshWire = (): WireState => ({
  infoSeq: null,
  readySeq: null,
  readySent: false,
  readyRetried: false,
  slotsSeq: null,
  awaitingSlots: false,
  pendingPrepared: null,
  pendingWorld: null,
  stateSeen: false,
  uploadsStarted: false,
  need: [],
  chunkBytes: DEFAULT_LIMITS.chunkBytes,
});

export { freshWire };
