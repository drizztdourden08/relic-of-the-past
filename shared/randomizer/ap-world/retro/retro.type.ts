/* @layer shared-game @kind types */
/**
 * The retro bow setting: the bow stops eating ammunition and starts eating
 * money.
 *
 * What the reference project's `retro_bow` really is (Options.py RetroBow —
 * "Zelda-1 like mode. You have to purchase an arrow to shoot arrows using
 * rupees"), read off its own patcher rather than off the name:
 *
 *  - Rom.py 1452-1454 turns on the rupee bow and writes TWO costs into the
 *    patched game — 0x180176, the plain arrow at 10 rupees, and 0x180178, the
 *    silver one at 50. Every shot is paid for at the moment it is fired;
 *  - Rom.py 1455-1459 takes arrows out of the world: the pot and fish prizes
 *    become rupees, the thief and the pikit steal rupees, the chest game hands
 *    over rupees. ItemPool.py 725-727 does the same to the pool, arrow
 *    capacity upgrades included;
 *  - one purchase survives, and it is not ammunition: Shops.py set_up_shops
 *    locks a single-arrow buy into one shelf at 80 and pushes it into five
 *    more, Rom.py 1451 skips it once bought, and StateHelpers.py
 *    can_shoot_arrows asks for the bow AND that purchase. This app gives that
 *    purchase its own name and its own item record, the QUIVER: bought once,
 *    and the thing that lets the bow fire at all.
 *
 * So the two numbers a player would want to move are the two COSTS PER SHOT,
 * not shop prices; the quiver's own 80 is the reference's constant and stays
 * one. The costs default to the reference's own, so a fresh profile that turns
 * retro on plays the retro a player already knows.
 */

interface RetroBowSetting {
  /** Arrows stop existing as ammunition; the bow is fed rupees instead. */
  enabled: boolean;
  /** Rupees one plain shot takes out of the wallet. */
  woodArrowCost: number;
  /** Rupees one silver shot takes — dearer, as the reference has it. */
  silverArrowCost: number;
}

export type { RetroBowSetting };
