/* @layer renderer-lib @kind logic */
import { buildItemCells, clampGearTier, gearTierCells, maxGearTier } from '@rotp/game-data';
import { resolveGlyph, slotGlyph } from '@rotp/input-mapping';
import { GROUP_GLYPH_ART } from '@domains/hud/compounds/HudNodeRenderer';
import type { GlyphSource } from '@shared/types/hud';
import type { HudGlyphSpec, HudSlotContent } from '@domains/hud/compounds/HudNodeRenderer';
import type { SlotAssignment, SlotIndex } from '@rotp/game-data';
import type { SdlAxisName, SdlButtonName } from '@rotp/game-data';
import type { SlotContent, SlotContentInput } from './slot-content.type';
import { NO_ASSIGNMENT } from './slot-content.constants';

const assignmentToken = (a: SlotAssignment | undefined): string =>
  (a?.kind === 'item' ? `item:${a.hudItem}` : a?.kind ?? 'none');

const equippedSwordSprite = (tier: number): string => {
  const cells = gearTierCells('sword', maxGearTier('sword'));
  return cells[clampGearTier('sword', tier)]?.sprite ?? '';
};

const fixedGearSprite = (assignment: SlotAssignment, swordSprite: string): string | null =>
  (assignment.kind === 'sword' ? (swordSprite || null) : null);

const buildSlotContent = (input: SlotContentInput): SlotContent => {
  const { slots, assignments, items, bottles, swordTier, packId, packs, family } = input;
  const itemCells = new Map(buildItemCells(items, bottles).map((cell) => [cell.hudItem, cell]));
  const swordSprite = equippedSwordSprite(swordTier);

  const content: Record<SlotIndex, HudSlotContent> = {};
  const glyphs = new Map<SlotIndex, GlyphSource | null>();
  const filledSlots: number[] = [];

  slots.forEach((slot) => {
    const assignment = assignments[slot.index] ?? NO_ASSIGNMENT;
    const cell = assignment.kind === 'item' ? itemCells.get(assignment.hudItem) : undefined;
    const itemSprite = assignment.kind === 'item' ? (cell?.sprite ?? null) : fixedGearSprite(assignment, swordSprite);
    content[slot.index] = {
      itemSprite,
      role: assignment.kind,
      dimmed: assignment.kind === 'none' || (assignment.kind === 'item' && !cell?.owned),
    };
    glyphs.set(slot.index, slotGlyph(slot, packId, family, packs));
    if (assignment.kind !== 'none') filledSlots.push(slot.index);
  });

  const glyph = (spec: HudGlyphSpec): GlyphSource | null => {
    const pack = spec.pack ?? packId;
    if (spec.position === 'DPAD') return GROUP_GLYPH_ART.DPAD ?? null;
    if (spec.slot !== undefined) return glyphs.get(spec.slot) ?? null;
    if (!spec.position) return null;
    return resolveGlyph(pack, spec.position as SdlButtonName | SdlAxisName, family, packs);
  };

  const signature = [
    family,
    ...slots.map((slot) => `${slot.index}=${assignmentToken(assignments[slot.index])}`),
  ].join('|');

  return { slots: content, filledSlots, glyph, signature };
};

export { buildSlotContent };
export type { SlotContent, SlotContentInput };
