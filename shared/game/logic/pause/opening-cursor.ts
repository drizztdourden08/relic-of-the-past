/* @layer shared-game @kind logic */
import type { CursorPos, GearLadderKind, PauseContext, PauseScreen } from './pause.type';
import { NO_ARROW_TYPE } from './gear-tiers.constants';
import { FIRST_BOTTLE_HUD_ITEM, LAST_HUD_ITEM } from './item-cells.constants';
import { clampCursor } from './clamp-cursor';
import { clampGearTier } from './clamp-gear-tier';
import { firstSectionOf } from './first-section-of';
import { isGearSection } from './is-gear-section';

const wornOn = (kind: GearLadderKind, ctx: PauseContext): number =>
  kind === 'bow' ? (ctx.gear.bow ?? NO_ARROW_TYPE) : ctx.gear[kind];

const equippedItemCell = (activeItem: number | undefined): CursorPos => {
  const active = activeItem ?? 0;
  if (!Number.isInteger(active) || active < 1 || active > LAST_HUD_ITEM) {
    return { section: 'items', cursor: 0 };
  }
  return active >= FIRST_BOTTLE_HUD_ITEM
    ? { section: 'bottles', cursor: active - FIRST_BOTTLE_HUD_ITEM }
    : { section: 'items', cursor: active - 1 };
};

const openingCursor = (screen: PauseScreen, ctx: PauseContext): CursorPos => {
  const section = firstSectionOf(screen);
  const at = screen === 'items'
    ? equippedItemCell(ctx.activeItem)
    : { section, cursor: isGearSection(section) ? clampGearTier(section, wornOn(section, ctx)) : 0 };
  return clampCursor(screen, at, ctx);
};

export { openingCursor };
