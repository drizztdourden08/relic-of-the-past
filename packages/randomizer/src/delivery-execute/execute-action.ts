/* @layer bridge-wasm @kind logic */
import { getModule } from '@rotp/game-core';
import type { EmscriptenModule } from '@rotp/game-core';
import type { DeliveryAction } from '../delivery-queue/delivery-queue.type';
import type { ExecuteOutcome, GiveItemAction, TriggerNpcCheckAction } from './delivery-execute.type';
import {
  HEART_PIECE_ID, QUIET_RECEIPT_GRANTED, QUIET_RECEIPT_NOT_QUIET, RECEIPT_REFUSED,
} from './delivery-execute.constants';
import { isReceiptGrant } from './is-receipt-grant';

const armReceiptMessage = (mod: EmscriptenModule, messageId: number): void => {
  mod.ccall('WasmSetNextReceiptMessage', null, ['number'], [messageId]);
};

const giveItem = (mod: EmscriptenModule, action: GiveItemAction): ExecuteOutcome => {
  if (action.receiptExport) {
    const messageId = action.messageOf?.() ?? action.messageId;
    if (messageId !== undefined) armReceiptMessage(mod, messageId);
    const status = mod.ccall('WasmGrantItemWithReceipt', 'number', ['number'], [action.itemId]);
    return status === RECEIPT_REFUSED ? 'refused' : 'done';
  }
  mod.ccall('WasmCheatGiveItem', null, ['number'], [action.itemId]);
  return 'done';
};

const triggerNpcCheck = (mod: EmscriptenModule, action: TriggerNpcCheckAction): ExecuteOutcome => {
  if (action.messageId !== undefined && action.itemId !== HEART_PIECE_ID) armReceiptMessage(mod, action.messageId);
  mod.ccall(action.assigned === true ? 'WasmTriggerNpcCheckAssigned' : 'WasmTriggerNpcCheck',
    null, ['number', 'number', 'number', 'number', 'number'],
    [action.flagType, action.flagMask, action.itemId, action.spriteType, action.postGfx]);
  return 'done';
};

const executeAction = (action: DeliveryAction): ExecuteOutcome => {
  const mod = getModule();
  if (!mod) return isReceiptGrant(action) || action.type === 'quiet_receipt' ? 'refused' : 'done';

  switch (action.type) {
    case 'quiet_receipt': {
      const status = mod.ccall('WasmGrantQuietReceipt', 'number', ['number'], [action.itemId]);
      if (status === QUIET_RECEIPT_NOT_QUIET) return executeAction(action.fallback);
      return status === QUIET_RECEIPT_GRANTED ? 'settled' : 'refused';
    }
    case 'give_item':
      return giveItem(mod, action);
    case 'trigger_check':
      mod.ccall('WasmTriggerCheck', null, ['number', 'number', 'number'],
        [action.roomId, action.chestIndex, action.itemId]);
      return 'done';
    case 'trigger_npc_check':
      return triggerNpcCheck(mod, action);
    case 'custom':
      action.execute();
      return 'done';
  }
};

export { executeAction };
