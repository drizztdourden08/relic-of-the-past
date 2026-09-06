/* @layer bridge-wasm @kind logic */
/**
 * Retro shelves, the JS-side arming for the in-core stock change a retro seed
 * with VANILLA shops needs (core/game-hooks/retro_shelf.c): the quiver's shelf
 * sells the quiver until it is owned and a refill after, every other arrow
 * shelf sells the refill, each at its own vanilla price. A shuffled scope puts
 * the quiver in the item pool instead and arms nothing here.
 *
 * Same contract as the other override bridges: the write only records; the
 * gate it answers to is the retro gate, which retro-bow.ts opens alongside the
 * costs, so a shelf can never be stocked without the bow that needs it.
 */

import { resolveLocalItemId } from './randomizer-client/item-lookup';
import { RETRO_QUIVER_ITEM } from '@shared/randomizer/ap-world/retro/retro-bow.data';
import { log } from '../log-bus';
import { getModule } from './wasm-bridge';
import type { RetroShelfStock } from '@shared/randomizer/ap-world/retro/retro-shops';

/** The core's "match anything" values, for a shop the earlier fields already name. */
const ENTRANCE_ANY = -1;
const OW_AREA_ANY = -1;

const setRetroShelves = (shelves: readonly RetroShelfStock[]): void => {
  if (shelves.length === 0) return;
  const mod = getModule();
  if (!mod) {
    log.error('[Randomizer] setRetroShelves called with no active module');
    return;
  }
  for (const shelf of shelves) {
    const { shop, slot, role, refillItem, refillPrice, quiverPrice } = shelf;
    const refillId = resolveLocalItemId(refillItem);
    if (refillId === undefined) {
      log.error(`[Randomizer] Retro shelf refused: refill "${refillItem}" is unresolvable`);
      continue;
    }
    mod.ccall('WasmSetRetroShelf', null, Array.from({ length: 7 }, () => 'number'), [
      shop.roomId, shop.entrance ?? ENTRANCE_ANY, shop.owArea ?? OW_AREA_ANY, slot.subtype,
      quiverPrice, refillId, refillPrice,
    ]);
    log.randomizer(`[Randomizer] Retro shelf armed: room 0x${shop.roomId.toString(16)} `
      + `subtype ${slot.subtype} ${role === 'quiver' ? `${RETRO_QUIVER_ITEM} at ${quiverPrice}, then ` : ''}`
      + `${refillItem} at ${refillPrice}`);
  }
};

const clearRetroShelves = (): void => {
  const mod = getModule();
  if (!mod) return;
  mod.ccall('WasmClearRetroShelves', null, [], []);
};

export { clearRetroShelves, setRetroShelves };
