/* @layer shared-game @kind data */
/**
 * What the final fight asks of the bow, read off the core rather than assumed.
 *
 * The evidence, all in the vendored core (read only, never edited here):
 *
 *  - sprite_main.c, the boss sprite's state 16: after the fourth ceiling fall
 *    the last phase opens with `sprite_health[k] = 96`.
 *  - sprite_main.c, the boss sprite's invincibility helper: a blade hit that
 *    lands while the hit timer reads 26 stuns the boss for 127 frames and
 *    switches its sprite type from 0xD6 to 0xD7 (`sprite_type[k] = 215`); state
 *    19 switches it back.
 *  - ancilla.c Ancilla_CheckDamageToSprite_aggressive: an arrow (damage class
 *    6) fired from the silver bow (`link_item_bow >= 3`) is promoted to class
 *    9, and a class-9 hit on type 0xD7 starts the 32-frame recoil.
 *  - the enemy damage table the ROM ships (asset kEnemyDamageData at 0x83e800,
 *    one nibble per damage class, unpacked by DecompressEnemyDamageSubclasses):
 *    type 0xD7 carries bucket 2 for class 9 and bucket 0 for every other
 *    class; type 0xD6 carries bucket 0 for both arrow classes. So only a
 *    silver shot on the stunned form scores at all.
 *  - sprite.c kEnemyDamages[9 * 8 + 2] = 24 per such hit, and Sprite_GiveDamage
 *    ends the sprite the moment health minus damage reaches zero.
 *
 * 96 / 24 = 4 exactly: four silver shots, each landed on a fresh stun, and
 * nothing can be farmed between them. Every reading that depends on the count
 * (the final fight's rule, the retro wallet floor, the arrow capacity floor) takes it
 * from here.
 */

/** Health the last phase opens with (sprite_main.c, state 16). */
const FINAL_FIGHT_HEALTH = 96;

/** What one silver shot takes off the stunned form (sprite.c kEnemyDamages, class 9 bucket 2). */
const FINAL_FIGHT_SILVER_DAMAGE = 24;

/** Silver shots the last phase takes, back to back: 4. */
const FINAL_FIGHT_SILVER_HITS = Math.ceil(FINAL_FIGHT_HEALTH / FINAL_FIGHT_SILVER_DAMAGE);

export { FINAL_FIGHT_HEALTH, FINAL_FIGHT_SILVER_DAMAGE, FINAL_FIGHT_SILVER_HITS };
