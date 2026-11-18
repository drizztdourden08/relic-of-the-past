/* @layer shared-hud @kind data */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { HudCountdownSource, HudVariableDef } from './variables.type';

const HUD_VARIABLES: readonly HudVariableDef[] = [
  { name: 'life_current', note: msg('hud:variable.life-current.note') },
  { name: 'life_max', note: msg('hud:variable.life-max.note') },
  { name: 'magic_current', note: msg('hud:variable.magic-current.note') },
  { name: 'magic_max', note: msg('hud:variable.magic-max.note') },
  { name: 'half_magic', note: msg('hud:variable.half-magic.note') },
  { name: 'armor', note: msg('hud:variable.armor.note') },
  { name: 'arrow_current', note: msg('hud:variable.arrow-current.note') },
  { name: 'arrow_max', note: msg('hud:variable.arrow-max.note') },
  { name: 'bomb_current', note: msg('hud:variable.bomb-current.note') },
  { name: 'bomb_max', note: msg('hud:variable.bomb-max.note') },
  { name: 'key_current', note: msg('hud:variable.key-current.note') },
  { name: 'rupee_current', note: msg('hud:variable.rupee-current.note') },
  { name: 'rupee_max', note: msg('hud:variable.rupee-max.note') },
  { name: 'silver_arrows', note: msg('hud:variable.silver-arrows.note') },
  { name: 'slot_count', note: msg('hud:variable.slot-count.note') },
  { name: 'countdown_active', note: msg('hud:variable.countdown-active.note') },
  { name: 'countdown_seconds', note: msg('hud:variable.countdown-seconds.note') },
  { name: 'countdown_frames', note: msg('hud:variable.countdown-frames.note') },
];

const HUD_SCOPE_EXTRAS = ['index', 'count', 'item'] as const;

const IDLE_COUNTDOWN: HudCountdownSource = { active: false, seconds: 0, frames: 0 };

const FULL_MAGIC = 128;

export { FULL_MAGIC, HUD_SCOPE_EXTRAS, HUD_VARIABLES, IDLE_COUNTDOWN };
