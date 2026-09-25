/* @layer renderer-lib @kind logic */
/**
 * Slots x assignments x inventory -> what each numbered slot draws.
 *
 * Three separate facts have to meet here and nowhere else: WHERE a control sits
 * (the device's slot list), WHAT it fires (the per-save assignment table), and
 * WHETHER the save actually holds that thing (the live inventory). Keeping them
 * apart until this point is what lets a player re-bind without losing an
 * assignment, and re-assign without disturbing where anything is drawn.
 *
 * A PURE FUNCTION over explicit inputs, because three surfaces need the same
 * answer from three different places: the live HUD reads the stores, the pause
 * menu reads the same stores, and the layout editor has to work with no game
 * running at all and against the player's own glyph packs. The editor once kept
 * its own copy of this, and the two drifted. That is the whole reason it is
 * one function now.
 *
 * A glyph is BINDING-FIRST (`slotGlyph`): a slot at EAST rebound to a key draws
 * that key's cap, never the pad artwork for a button pressing which does
 * nothing. The synthetic `DPAD` position is the one glyph that stands for a
 * whole control instead of a position, and it resolves through the renderer's
 * own table, not through a pack. See `HudNodeRenderer.constants.ts`.
 *
 * Item sprites resolve through the record dataset, exactly as the pause grid
 * does: `buildItemCells` already answers "which art, and is it owned" for all
 * 24 hud-item ids, including the two cells that share a save slot and the four
 * bottles. Copying a sprite table in here would put the game's own item names
 * into renderer code and drift the day an upgrade tier changes.
 */
import { buildItemCells, clampGearTier, gearTierCells, maxGearTier } from '@shared/game/logic/pause';
import { resolveGlyph, slotGlyph } from '@shared/input/glyphs';
import { GROUP_GLYPH_ART } from '@domains/hud/compounds/HudNodeRenderer';
import type { DeviceFamily } from '@shared/types/controls';
import type { GlyphPack, GlyphSource } from '@shared/types/hud';
import type { HudGlyphSpec, HudSlotContent } from '@domains/hud/compounds/HudNodeRenderer';
import type { ModernSlot, SlotAssignment, SlotIndex } from '@shared/types/controls/scheme';
import type { SdlAxisName, SdlButtonName } from '@shared/input/sdl-buttons';

interface SlotContentInput {
  slots: readonly ModernSlot[];
  assignments: Readonly<Record<SlotIndex, SlotAssignment>>;
  /** The 20 inventory bytes and the 4 bottle bytes, as the core reports them. */
  items: readonly number[];
  bottles: readonly number[];
  swordTier: number;
  /** The document's pack, or 'auto' to follow the device family. */
  packId: string;
  packs: readonly GlyphPack[];
  family: DeviceFamily;
}

interface SlotContent {
  slots: Record<SlotIndex, HudSlotContent>;
  /** Slot numbers that fire something right now. The engine's `dimWhenEmpty`
   *  reads this, which is what dims a whole group at once. */
  filledSlots: number[];
  glyph: (spec: HudGlyphSpec) => GlyphSource | null;
  /** Changes when an assignment moves or a different pad is plugged in. Those are
   *  the two events the 'on-change' reveal exists for, and nothing else. */
  signature: string;
}

const NONE: SlotAssignment = { kind: 'none' };

/** An assignment reduced to a comparable token. The item id matters, so
 *  swapping two items between buttons still counts as a change. */
const assignmentToken = (a: SlotAssignment | undefined): string =>
  (a?.kind === 'item' ? `item:${a.hudItem}` : a?.kind ?? 'none');

/** The art for the tier the save is wearing right now. Every tier is drawn as
 *  owned, because the player is holding it by definition. */
const equippedSwordSprite = (tier: number): string => {
  const cells = gearTierCells('sword', maxGearTier('sword'));
  return cells[clampGearTier('sword', tier)]?.sprite ?? '';
};

const buildSlotContent = (input: SlotContentInput): SlotContent => {
  const { slots, assignments, items, bottles, swordTier, packId, packs, family } = input;
  const itemCells = new Map(buildItemCells(items, bottles).map((cell) => [cell.hudItem, cell]));
  const swordSprite = equippedSwordSprite(swordTier);

  const content: Record<SlotIndex, HudSlotContent> = {};
  const glyphs = new Map<SlotIndex, GlyphSource | null>();
  const filledSlots: number[] = [];

  slots.forEach((slot) => {
    const assignment = assignments[slot.index] ?? NONE;
    const cell = assignment.kind === 'item' ? itemCells.get(assignment.hudItem) : undefined;
    // The action button is contextual (talk, lift, open, dash), so it wears no
    // sprite. Only the sword names a fixed piece of gear, and it shows the tier
    // the save holds.
    const itemSprite = assignment.kind === 'item' ? (cell?.sprite ?? null)
      : assignment.kind === 'sword' ? (swordSprite || null)
        : null;
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
