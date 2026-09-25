/* @layer renderer-hud @kind hook */
/**
 * The live half of what a placed layout draws: what each numbered slot fires,
 * whether the save holds it, and which artwork its control wears.
 *
 * The arithmetic is `buildSlotContent`, which is pure and shared with the
 * editor's preview; this hook is only the three stores it reads from. Keeping
 * the two apart is what stopped the editor and the live HUD disagreeing about a
 * rebound button, which they did while each kept its own copy of the rule.
 *
 * EVERY SLOT IS ANSWERED FOR, in gameplay exactly as in the pause menu. There
 * is no filter to the assigned ones: the button map answers "what have I got
 * left?", and a map that hid its empty buttons could not.
 */
import { useMemo } from 'react';
import { AUTO_PACK_ID } from '@shared/input/glyphs';
import { buildSlotContent } from '@app/lib/hud/slot-content';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { useControlSchemeStore } from '@app/stores/control-scheme-store';
import { declaredDeviceFamily } from './declared-family';
import { deviceFamilyOf } from './device-family';
import { useGlyphPacks } from './useGlyphPacks';
import type { ModernBindings, ModernSlot, SlotAssignment, SlotIndex } from '@shared/types/controls/scheme';
import type { SlotContent } from '@app/lib/hud/slot-content';

/**
 * The part of the control-scheme store this hook depends on (contract section
 * 10). Declared structurally instead of imported so the dependency is a shape,
 * not a coupling: the store itself belongs to the runtime agent, and annotating
 * the selectors here keeps this file fully typed either way.
 */
interface ControlSchemeSlice {
  bindings: ModernBindings | null;
  assignments: Record<SlotIndex, SlotAssignment>;
}

const useSlotContent = (packId: string = AUTO_PACK_ID): SlotContent => {
  const bindings = useControlSchemeStore((s: ControlSchemeSlice) => s.bindings);
  const assignments = useControlSchemeStore((s: ControlSchemeSlice) => s.assignments);
  const items = useGameUIStore((s) => s.inventory.items);
  const bottles = useGameUIStore((s) => s.inventory.bottles);
  const swordTier = useGameUIStore((s) => s.equipment.sword);
  // The player's own packs and the shipped ones, or a custom pack would be
  // resolved against a list it is not in and silently fall through to the family.
  const packs = useGlyphPacks();

  return useMemo(() => {
    const slots: readonly ModernSlot[] = bindings?.slots ?? [];
    return buildSlotContent({
      slots,
      assignments,
      items,
      bottles,
      swordTier,
      packId,
      packs,
      family: deviceFamilyOf(slots, declaredDeviceFamily()),
    });
  }, [assignments, bindings, bottles, items, packId, packs, swordTier]);
};

export { useSlotContent };
