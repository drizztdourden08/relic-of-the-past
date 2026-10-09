/* @layer tests @kind data */
import type { OptionValue } from '@shared/randomizer/world/options.type';

interface ParityCase {
  name: string;
  overrides: Record<string, OptionValue>;
  carried?: boolean;
  quiver?: boolean;
  foreign?: boolean;
}

const CASES: readonly ParityCase[] = [
  { name: 'the default snapshot (npc checks on)', overrides: {} },
  {
    name: 'npc checks, world items and key drops off (locked vanilla rows)',
    overrides: { include_npc_checks: false, include_world_items: false, key_drop_shuffle: false },
  },
  {
    name: 'the capacity pond on four prizes, asking for each',
    overrides: {
      pond_capacity_mode: 'custom', pond_capacity_items: 4, pond_capacity_throws: 4,
      pond_capacity_ask_rupees_min: '900', pond_capacity_ask_rupees_max: '999',
    },
  },
  {
    name: 'custom capacity in fixed jumps',
    overrides: {
      capacity_progressive: false, capacity_explosives_mode: 'custom',
      capacity_wallet_mode: 'custom', capacity_wallet_start: '0', capacity_wallet_max: '999',
    },
  },
  { name: 'npc, pond and world spots carried in slot data', overrides: {}, carried: true },
  { name: 'the retro bow, its quiver placed in the pool', overrides: { retro_bow: true, shop_item_slots: 6 }, quiver: true },
  {
    name: 'another player\'s items on every pond rung, every pond prize and a shop shelf',
    overrides: {
      pond_capacity_mode: 'custom', pond_capacity_items: 4, pond_capacity_throws: 4,
      pond_wishing_mode: 'custom', pond_wishing_items: 4, pond_wishing_throws: 4,
      pond_cursed_mode: 'custom', pond_cursed_items: 4, pond_cursed_throws: 4, shop_item_slots: 6,
    },
    foreign: true,
  },
];

const OTHER_SLOT = 2;
const QUIVER_RECEIPT = 0x43;
const SEED = 'parity-t12';
const WORD_5 = /^WasmSetGateWord\(\[5,(\d+)\]\)$/;
const NAMED_FOREIGN_LINE = /\[(?:"(?:[^"\\]|\\.)*",)*"Sent to Zelda!"\]/g;
const FOREIGN_ARMS = [/^WasmSetPondPrize\(\[\d+,254,/, /^WasmArmWishPondPlan\(\[\d+,\d+,254,/, /^WasmSetShopSlotOverride\(\[(?:-?\d+,){9}254,/];

export { CASES, FOREIGN_ARMS, NAMED_FOREIGN_LINE, OTHER_SLOT, QUIVER_RECEIPT, SEED, WORD_5 };
export type { ParityCase };
