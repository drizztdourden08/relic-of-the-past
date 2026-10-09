/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { getModule } from '@rotp/game-core';
import { CAPACITY_FAMILY_INDEX } from '@rotp/randomizer';
import type { CapacityFixedLineArm } from '@rotp/randomizer';

const setCapacityFixedLines = (lines: readonly CapacityFixedLineArm[]): void => {
  if (lines.length === 0) return;
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] setCapacityFixedLines called with no active module');
    return;
  }
  for (const { family, fromRung, jump, messageId } of lines) {
    mod.ccall('WasmSetCapacityFixedLine', null, ['number', 'number', 'number', 'number'],
      [CAPACITY_FAMILY_INDEX[family], fromRung, jump, messageId]);
  }
  log.randomizer(`[Randomizer] Capacity fixed lines set: ${lines.length} (rung, jump) entries`);
};

export { setCapacityFixedLines };
