/* @layer bridge-wasm @kind logic */
/**
 * Capacity fixed lines: JS-side arming of the (family, starting rung, jump)
 * → receipt-line table the core's fixed-jump resolvers read
 * (core/game-hooks/capacity_fixed_lines.c): when a fixed item lands, the
 * core looks up the line pre-rendered for the rung it climbed from and shows
 * it in place of the location's jump-only line. Record-only writes, the same
 * contract as the plan and the wallet table; the read side answers to the
 * grant seams and kFeatures3_ReceiptMessages. The session layer composes the
 * entries from the family plans; this file is the ccall surface only.
 */

import { log } from '../log-bus';
import { getModule } from './wasm-bridge';
import { CAPACITY_FAMILY_INDEX } from './capacity-profile.constants';
import type { CapacityFamilyId } from '@shared/game/data';

interface CapacityFixedLineArm {
  family: CapacityFamilyId;
  fromRung: number;
  jump: number;
  /** The pre-rendered line's message id in the session dialogue. */
  messageId: number;
}

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

const clearCapacityFixedLines = (): void => {
  const mod = getModule();
  if (!mod) return;
  mod.ccall('WasmClearCapacityFixedLines', null, [], []);
};

export { clearCapacityFixedLines, setCapacityFixedLines };
export type { CapacityFixedLineArm };
