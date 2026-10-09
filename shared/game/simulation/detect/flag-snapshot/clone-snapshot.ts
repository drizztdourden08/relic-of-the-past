/* @layer shared-game @kind logic */
import type { FlagSnapshot } from '../../types';

const cloneSnapshot = (snap: FlagSnapshot): FlagSnapshot => ({
  dungInfo: Uint16Array.from(snap.dungInfo),
  owEventInfo: Uint8Array.from(snap.owEventInfo),
  progress: Uint8Array.from(snap.progress),
});

export { cloneSnapshot };
