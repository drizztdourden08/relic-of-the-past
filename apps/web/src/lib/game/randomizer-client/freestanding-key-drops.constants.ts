/* @layer bridge-wasm @kind constants */
import type { FreestandingKeyDrop } from './freestanding-key-drops.type';

const FREESTANDING_KEY_BY_CHECK: ReadonlyMap<string, FreestandingKeyDrop> = new Map([
  ['check-135', { roomId: 135, big: false }],
]);

export { FREESTANDING_KEY_BY_CHECK };
