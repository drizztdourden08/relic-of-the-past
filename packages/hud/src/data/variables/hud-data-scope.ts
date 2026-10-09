/* @layer shared-hud @kind logic */
import { FULL_MAGIC, IDLE_COUNTDOWN } from './variables-table.constants';
import type { HudCountdownSource, HudVitalsSource } from './variables.type';

const hudDataScope = (
  vitals: HudVitalsSource, slotCount: number, countdown: HudCountdownSource = IDLE_COUNTDOWN,
): Record<string, number> => ({
  life_current: vitals.healthCurrent,
  life_max: vitals.healthCapacity,
  magic_current: vitals.magic,
  magic_max: FULL_MAGIC,
  half_magic: vitals.halfMagic ? 1 : 0,
  armor: vitals.armor,
  arrow_current: vitals.arrows,
  arrow_max: vitals.maxArrows,
  bomb_current: vitals.bombs,
  bomb_max: vitals.maxBombs,
  key_current: vitals.keys,
  rupee_current: vitals.rupees,
  rupee_max: vitals.maxRupees,
  silver_arrows: vitals.hasSilverArrows ? 1 : 0,
  slot_count: slotCount,
  countdown_active: countdown.active ? 1 : 0,
  countdown_seconds: countdown.active ? countdown.seconds : 0,
  countdown_frames: countdown.active ? countdown.frames : 0,
});

export { hudDataScope };
