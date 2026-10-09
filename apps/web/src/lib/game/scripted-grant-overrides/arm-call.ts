/* @layer bridge-wasm @kind logic */
import type { LiveModule, SingleArmSurface } from './scripted-grant-overrides.type';
import { setPondPrize } from '../pond-plan';

const armCall = (mod: LiveModule, target: SingleArmSurface,
  newItem: number, messageId: number, fireId: number): void => {
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
