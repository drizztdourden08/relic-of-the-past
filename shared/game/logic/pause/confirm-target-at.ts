/* @layer shared-game @kind logic */
import type { ConfirmTarget, GearLadderKind, PauseContext, PauseState } from './pause.type';
import { ARROW_LADDER, BARE_TIER, NO_ARROW_TYPE } from './gear-tiers.constants';
import { SAVE_QUIT_CURSOR } from './screens.constants';
import { clampCursor } from './clamp-cursor';
import { clampGearTier } from './clamp-gear-tier';
import { isGearSection } from './is-gear-section';

const arrowTargetAt = (tier: number, ctx: PauseContext): ConfirmTarget | null => {
  const worn = ctx.gear.bow ?? NO_ARROW_TYPE;
  if (worn === NO_ARROW_TYPE || tier === worn) return null;
  return { kind: 'equip', gear: ARROW_LADDER, tier };
};

const gearTargetAt = (gear: GearLadderKind, tier: number, ctx: PauseContext): ConfirmTarget | null => {
  if (gear === ARROW_LADDER) return arrowTargetAt(tier, ctx);
  const worn = clampGearTier(gear, ctx.gear[gear]);
  const next = tier === worn ? BARE_TIER : tier;
  if (next === worn) return null;
  return next === BARE_TIER ? { kind: 'unequip', gear } : { kind: 'equip', gear, tier: next };
};

const confirmTargetAt = (state: PauseState, ctx: PauseContext): ConfirmTarget | null => {
  if (state.phase !== 'browsing') return null;
  if (state.screen === 'gear') {
    if (!isGearSection(state.section)) return null;
    const at = clampCursor('gear', { section: state.section, cursor: state.cursor }, ctx);
    return isGearSection(at.section) ? gearTargetAt(at.section, at.cursor, ctx) : null;
  }
  if (state.screen === 'status' && state.section === 'actions') {
    const at = clampCursor('status', { section: 'actions', cursor: state.cursor }, ctx);
    return { kind: 'exit', via: at.cursor === SAVE_QUIT_CURSOR ? 'save-quit' : 'continue' };
  }
  return null;
};

export { confirmTargetAt };
