/* @layer bridge-wasm @kind logic */
import { setPondPrize } from '../pond-plan';
import type { ArmCallParams } from './arm-call.type';

const armCall = (params: ArmCallParams): void => {
  const { mod, target, newItem, messageId, fireId } = params;
  if (target.surface === 'pond') {
    setPondPrize({ prize: target.prize, newItem, messageId, fireId });
    return;
  }
  if (target.surface === 'capacity') {
    mod.ccall('WasmSetCapacityGrantOverride', null, ['number', 'number', 'number', 'number'],
      [target.kind, newItem, messageId, fireId]);
    return;
  }
  if (target.surface === 'bat') {
    mod.ccall('WasmSetBatGrantOverride', null, ['number', 'number', 'number'],
      [newItem, messageId, fireId]);
    return;
  }
  mod.ccall('WasmSetMinigamePrizeOverride', null, ['number', 'number', 'number', 'number'],
    [target.roomId, newItem, messageId, fireId]);
};

export { armCall };
