/* @layer renderer-lib @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { I18n, Message } from '@drizztdourden08/brock-core/i18n';
import type { CapacityFamilyId } from '@rotp/randomizer';

const FAMILY_LABEL: Readonly<Record<CapacityFamilyId, Message>> = {
  explosives: msg('randomizer:capacity-row.family.explosives'),
  projectiles: msg('randomizer:capacity-row.family.projectiles'),
  meter: msg('randomizer:capacity-row.family.meter'),
  wallet: msg('randomizer:capacity-row.family.wallet'),
};

const JUMP_LABEL: Readonly<Record<CapacityFamilyId, (jump: number, t: I18n['t']) => string>> = {
  explosives: (jump, t) => t('randomizer:capacity-row.jump-tiers', { count: jump }),
  projectiles: (jump, t) => t('randomizer:capacity-row.jump-tiers', { count: jump }),
  meter: (jump, t) => t('randomizer:capacity-row.jump-tiers', { count: jump }),
  wallet: (jump) => `+${jump * 100}`,
};

const VANILLA_NOTE: Readonly<Record<CapacityFamilyId, Message>> = {
  explosives: msg('randomizer:capacity-row.vanilla-note.pond'),
  projectiles: msg('randomizer:capacity-row.vanilla-note.pond'),
  meter: msg('randomizer:capacity-row.vanilla-note.bat'),
  wallet: msg('randomizer:capacity-row.vanilla-note.wallet'),
};

const PROGRESSIVE_NOTE = msg('randomizer:capacity-row.progressive-note');

const WALLET_SCALE = { rangeStep: 10, labelEvery: 10 };
const STEP_SCALE = { rangeStep: 1, labelEvery: 1 };

export { FAMILY_LABEL, JUMP_LABEL, PROGRESSIVE_NOTE, STEP_SCALE, VANILLA_NOTE, WALLET_SCALE };
