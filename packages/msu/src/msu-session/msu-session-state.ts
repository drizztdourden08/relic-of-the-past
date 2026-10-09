/* @layer bridge-wasm @kind logic */
import type { MsuSessionState } from './msu-session.type';

const msuSessionState: MsuSessionState = { engine: null, pending: null, pollId: null };

export { msuSessionState };
