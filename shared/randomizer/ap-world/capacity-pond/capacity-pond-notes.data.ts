/* @layer shared-game @kind data */
/**
 * The plain sentences the capacity/pond rule shows the player. Kept as data
 * so both tabs say exactly the same thing about the same state, and so the
 * wording can be read without reading the rule.
 */

const CAPACITY_POND_NOTES = {
  /** The master switch is off. */
  off: 'Capacity upgrades are off, so the wishing pond sells bomb and arrow upgrades.',
  /** The pond sells throws, so the families it used to stock cannot be left on Vanilla. */
  forcedInPool: 'The pond hands out pool items, so Explosives and Projectiles cannot be left on Vanilla.',
  /** The same, with retro bow on: only the explosives family is still the pond's to stock. */
  forcedInPoolRetro: 'The pond hands out pool items, so Explosives cannot be left on Vanilla.',
  /** The other half of the same rule, said from the pond side. */
  modeUnavailable: 'The pond cannot sell upgrades while a family is in the pool. Set both to Vanilla '
    + 'or Custom to restore it.',
  /** The same, with retro bow on: one family decides. */
  modeUnavailableRetro: 'The pond cannot sell upgrades while Explosives is in the pool. Set it to Vanilla '
    + 'or Custom to restore it.',
  /** Shown in red on the projectiles card while retro bow is on. */
  retroProjectiles: 'Off while retro bow is on',
} as const;

export { CAPACITY_POND_NOTES };
