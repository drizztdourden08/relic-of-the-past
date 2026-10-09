/* @layer shared-game @kind data */
const CAPACITY_POND_NOTES = {
  off: 'Capacity upgrades are off, so the wishing pond sells bomb and arrow upgrades.',
  forcedInPool: 'The pond hands out pool items, so Explosives and Projectiles cannot be left on Vanilla.',
  forcedInPoolRetro: 'The pond hands out pool items, so Explosives cannot be left on Vanilla.',
  modeUnavailable: 'The pond cannot sell upgrades while a family is in the pool. Set both to Vanilla '
    + 'or Custom to restore it.',
  modeUnavailableRetro: 'The pond cannot sell upgrades while Explosives is in the pool. Set it to Vanilla '
    + 'or Custom to restore it.',
  retroProjectiles: 'Off while retro bow is on',
} as const;

export { CAPACITY_POND_NOTES };
