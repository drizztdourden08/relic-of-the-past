/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { armNpcOverrideGate } from './arm-npc-override-gate';
import { CLASS_TEMPLATE_MESSAGE, NPC_NO_FIRE_ID } from '@rotp/randomizer';
import { refuseNpcOverride } from './refuse-npc-override';
import type { SetNpcGrantSpriteOverrideParams } from './set-npc-grant-override.type';

const setNpcGrantSpriteOverride = (params: SetNpcGrantSpriteOverrideParams): void => {
  const { spriteType, vanillaItem, newItem, messageId = CLASS_TEMPLATE_MESSAGE, fireId = NPC_NO_FIRE_ID } = params;
  if (refuseNpcOverride(vanillaItem, newItem, `sprite 0x${spriteType.toString(16)}`)) return;
  const mod = armNpcOverrideGate();
  if (!mod) return;
  mod.ccall('WasmSetNpcGrantSpriteOverride', null, ['number', 'number', 'number', 'number', 'number'],
    [spriteType, vanillaItem, newItem, messageId, fireId]);
  log.randomizer(`[Randomizer] Npc override set: sprite 0x${spriteType.toString(16)} `
    + `item 0x${vanillaItem.toString(16)} -> 0x${newItem.toString(16)} (msg ${messageId})`);
};

export { setNpcGrantSpriteOverride };
