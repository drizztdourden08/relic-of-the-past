/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { getModule } from '../wasm-bridge';
import { WALLET_JUMP_SLOTS, WALLET_LADDER_LAST } from './capacity-profile.constants';

const setWalletJumpTable = (rungsBySlot: readonly number[]): void => {
  if (rungsBySlot.length > WALLET_JUMP_SLOTS) {
    log.error(`[Randomizer] Wallet jump table refused: ${rungsBySlot.length} entries exceed `
      + `the ${WALLET_JUMP_SLOTS} slots`);
    return;
  }
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] setWalletJumpTable called with no active module');
    return;
  }
  mod.ccall('WasmClearWalletJumpTable', null, [], []);
  rungsBySlot.forEach((rungs, slot) => {
    mod.ccall('WasmSetWalletJumpTable', null, ['number', 'number'],
      [slot, Math.min(WALLET_LADDER_LAST, Math.max(0, Math.trunc(rungs)))]);
  });
  log.randomizer(`[Randomizer] Wallet jump table set: [${rungsBySlot.join(', ')}]`);
};

export { setWalletJumpTable };
