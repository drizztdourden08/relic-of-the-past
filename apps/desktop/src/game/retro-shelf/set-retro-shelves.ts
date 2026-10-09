/* @layer bridge-wasm @kind logic */
import type { RetroShelfStock } from '@rotp/randomizer';
import { resolveLocalItemId, RETRO_QUIVER_ITEM } from '@rotp/randomizer';
import { log } from '../../log-bus';
import { getModule, ENTRANCE_ANY, OW_AREA_ANY, RETRO_SHELF_ARG_COUNT } from '@rotp/game-core';

const setRetroShelves = (shelves: readonly RetroShelfStock[]): void => {
  if (shelves.length === 0) return;
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] setRetroShelves called with no active module');
    return;
  }
  for (const shelf of shelves) {
    const { role, refillItem, refillPrice, quiverPrice } = shelf;
    const refillId = resolveLocalItemId(refillItem);
    if (refillId === undefined) {
      log.error(`[Randomizer] Retro shelf refused: refill "${refillItem}" is unresolvable`);
      continue;
    }
    mod.ccall('WasmSetRetroShelf', null, Array.from({ length: RETRO_SHELF_ARG_COUNT }, () => 'number'), [
      shelf.roomId, shelf.entrance ?? ENTRANCE_ANY, shelf.owArea ?? OW_AREA_ANY, shelf.subtype,
      quiverPrice, refillId, refillPrice,
    ]);
    log.randomizer(`[Randomizer] Retro shelf armed: room 0x${shelf.roomId.toString(16)} `
      + `subtype ${shelf.subtype} ${role === 'quiver' ? `${RETRO_QUIVER_ITEM} at ${quiverPrice}, then ` : ''}`
      + `${refillItem} at ${refillPrice}`);
  }
};

export { setRetroShelves };
