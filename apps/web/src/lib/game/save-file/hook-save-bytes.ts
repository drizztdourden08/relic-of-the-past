/* @layer bridge-wasm @kind data */
/**
 * TS mirror of the hook-owned save-byte registry.
 *
 * The addresses themselves are allocated in `core/game-hooks/save_bytes.h`, which is the
 * single source of truth and carries the compile-time no-overlap checks. This file exists
 * because the offline save-file reader and the headless core probes have to name the same
 * bytes from TypeScript, and they were each spelling their own literal.
 *
 * Nothing here may be changed on its own: `tests/randomizer/hook-save-bytes.keep.test.ts`
 * parses the C header and fails the moment the two disagree.
 */

/** Base of the battery block the game saves and checksums (`SAVE_BLOCK_BASE`). */
const SAVE_BLOCK_BASE = 0xf000;

/** First and last address of the run inside that block which is the hook layer's. */
const HOOK_SAVE_FIRST = 0xf406;
const HOOK_SAVE_LAST = 0xf4fd;

/** npc_overrides.c — substitution-completion bits, one bit per possession-gated giver. */
const SRM_SUBSTITUTION_TAKEN = 0xf410;
const SRM_SUBSTITUTION_TAKEN_COUNT = 3;

/** capacity_profile.c — the wallet ladder rung this file has climbed to. */
const SRM_WALLET_LADDER_INDEX = 0xf413;

/** capacity_profile.c — one empty-rung flag per counted family (explosives, projectiles, meter). */
const SRM_EMPTY_RUNG = 0xf414;
const SRM_EMPTY_RUNG_COUNT = 3;

/** prize_grants.c — one bit per palace index: this dungeon's falling reward was handed over. */
const SRM_PRIZE_TAKEN = 0xf417;
const SRM_PRIZE_TAKEN_COUNT = 2;

/** prize_grants.c — the crystal bit the receipt in flight must bank, 0 for none. */
const SRM_PENDING_CRYSTAL = 0xf419;

/** pond_plan.c — how many throws of the planned sequence have been paid for. */
const SRM_POND_THROWS = 0xf41a;

/** shop_table.c — one byte per canonical shop slot: armed steps already bought. */
const SRM_SHOP_SOLD = 0xf420;
const SRM_SHOP_SOLD_COUNT = 31;

/** A save-block address as a byte offset inside one battery-save file block. */
const blockOffsetOf = (wramAddress: number): number => wramAddress - SAVE_BLOCK_BASE;

export {
  HOOK_SAVE_FIRST,
  HOOK_SAVE_LAST,
  SAVE_BLOCK_BASE,
  SRM_EMPTY_RUNG,
  SRM_EMPTY_RUNG_COUNT,
  SRM_PENDING_CRYSTAL,
  SRM_POND_THROWS,
  SRM_PRIZE_TAKEN,
  SRM_PRIZE_TAKEN_COUNT,
  SRM_SHOP_SOLD,
  SRM_SHOP_SOLD_COUNT,
  SRM_SUBSTITUTION_TAKEN,
  SRM_SUBSTITUTION_TAKEN_COUNT,
  SRM_WALLET_LADDER_INDEX,
  blockOffsetOf,
};
