/* @layer renderer-app @kind logic */
import { getModule } from '@rotp/game-core';
import { buildHeapReads } from '@rotp/randomizer';
import type { MemoryBridge } from '@drizztdourden08/brock-randomizer/session';
import { memoryViewOf } from './rotp-memory-view';
import { onStateLoaded } from './state-loaded-listeners';

const rotpMemoryBridge: MemoryBridge = {
  view: () => {
    const mod = getModule();
    if (!mod) return null;
    const reads = buildHeapReads(mod);
    return reads ? memoryViewOf(reads) : null;
  },
  onStateLoaded,
};

export { rotpMemoryBridge };
