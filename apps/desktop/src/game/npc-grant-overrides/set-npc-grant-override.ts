/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { armNpcOverrideGate } from './arm-npc-override-gate';
import { CLASS_TEMPLATE_MESSAGE, NPC_NO_FIRE_ID, ROOM_ANY } from '@rotp/randomizer';
import { refuseNpcOverride } from './refuse-npc-override';
import type { SetNpcGrantOverrideParams } from './set-npc-grant-override.type';

const setNpcGrantOverride = (params: SetNpcGrantOverrideParams): void => {
  const { roomId, vanillaItem, newItem, messageId = CLASS_TEMPLATE_MESSAGE, fireId = NPC_NO_FIRE_ID } = params;
  if (refuseNpcOverride(vanillaItem, newItem, `room ${roomId ?? 'any'}`)) return;
  const mod = armNpcOverrideGate();
  if (!mod) return;
  mod.ccall('WasmSetNpcGrantOverride', null, ['number', 'number', 'number', 'number', 'number'],
    [roomId ?? ROOM_ANY, vanillaItem, newItem, messageId, fireId]);
  log.randomizer(`[Randomizer] Npc override set: room ${roomId ?? 'any'} `
    + `item 0x${vanillaItem.toString(16)} -> 0x${newItem.toString(16)} (msg ${messageId})`);
};

export { setNpcGrantOverride };
