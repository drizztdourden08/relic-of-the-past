/* @layer renderer-components @kind hook */
/**
 * What the editor's preview draws against.
 *
 * THE VITALS PREFER THE RUNNING GAME; THE SLOTS NEVER DO. Those two halves
 * answer different questions and so are sourced differently:
 *
 *  - The vitals decide SIZE: heart rows and how wide the counts run. So
 *    a player who alt-tabs out of a running save arranges against their own
 *    numbers, and a player with nothing running gets a plausible save chosen to
 *    exercise the same size questions (fourteen of twenty hearts, half a meter,
 *    two- and three-digit counts, a four-figure purse).
 *  - The slots are always SAMPLE. Every placeholder is dealt a random item so
 *    the density of a cluster can be judged; a live save with two things
 *    assigned would draw two sprites and eight blanks, which says nothing about
 *    whether the arrangement holds. The stage labels it as sample content, and
 *    none of it is written anywhere.
 *
 * THE SLOT LIST COMES FROM THE SCHEME BEING EDITED FOR, not from the pad in
 * hand: that is what makes the pad layout draw pad glyphs and the keyboard
 * layout draw key caps, whichever device happens to be plugged in right now.
 *
 * The content it produces is the SAME shape the live HUD hands the renderer,
 * built by the same `buildSlotContent`, so a preview cannot disagree with the
 * game about what a rebound button looks like.
 */
import { useMemo } from 'react';
import { hudDataScope } from '@shared/hud/data';
import { getSpritesBase } from '@shared/game/logic/queries/item-sprites';
import { buildSlotContent } from '@app/lib/hud/slot-content';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { useHudSettingsStore } from '@app/stores/hud-settings-store';
import { deviceFamilyOf } from '@domains/hud/views/HudLayoutView/behavior/device-family';
import {
  SAMPLE_BOTTLES, SAMPLE_HUD, SAMPLE_ITEMS, SAMPLE_SLOTS, SAMPLE_SWORD_TIER, sampleSlotAssignments,
} from './sample-state';
import type { EditorSampleState } from './useSampleState.type';
import type { GlyphPack } from '@shared/types/hud';
import type { ModernSlot } from '@shared/types/controls';
import type { Size } from '@shared/hud/layouts';

/** Bow tier 3 and up is the silver art, exactly as the live HUD reads it. */
const SILVER_ARROW_TIER = 3;
/** Health is stored in eighths of a heart. */
const HEALTH_PER_HEART = 8;

interface SampleStateArgs {
  packId: string;
  packs: readonly GlyphPack[];
  /** The scheme being edited for. Empty falls back to a plausible eight. */
  slots: readonly ModernSlot[];
  /** The stage's chosen aspect, in SNES pixels. */
  view: Size;
}

const useSampleState = (args: SampleStateArgs): EditorSampleState => {
  const { packId, packs, slots: schemeSlots, view } = args;
  const hud = useGameUIStore((s) => s.hud);
  const items = useGameUIStore((s) => s.inventory.items);
  const armor = useGameUIStore((s) => s.equipment.armor);
  const { heartMode, showMaxInYellow } = useHudSettingsStore();

  // A save with no heart containers has never been loaded, so there is nothing
  // live to prefer. That is the whole liveness test, and it needs no extra flag.
  const live = hud.healthCapacity > 0;

  return useMemo(() => {
    const counters = live ? hud : SAMPLE_HUD;
    const slots = schemeSlots.length > 0 ? schemeSlots : SAMPLE_SLOTS;
    const content = buildSlotContent({
      slots,
      assignments: sampleSlotAssignments(slots),
      items: SAMPLE_ITEMS,
      bottles: SAMPLE_BOTTLES,
      swordTier: SAMPLE_SWORD_TIER,
      packId,
      packs,
      family: deviceFamilyOf(slots),
    });

    const vitals = {
      healthCurrent: counters.healthCurrent,
      healthCapacity: counters.healthCapacity,
      heartMode,
      armor: live ? armor : 0,
      magic: counters.magicPower,
      halfMagic: counters.halfMagic,
      bombs: counters.bombs,
      maxBombs: counters.maxBombs,
      arrows: counters.arrows,
      maxArrows: counters.maxArrows,
      keys: counters.keys,
      hasSilverArrows: (live ? items[0] ?? 0 : SAMPLE_ITEMS[0]) >= SILVER_ARROW_TIER,
      rupees: counters.rupees,
      maxRupees: counters.maxRupees,
      showMaxInYellow,
    };

    return {
      live,
      slots,
      content: { vitals, slots: content.slots, glyph: content.glyph },
      filledSlots: content.filledSlots,
      hearts: Math.floor(counters.healthCapacity / HEALTH_PER_HEART),
      dataScope: hudDataScope(vitals, slots.length),
      view,
      spritesBase: getSpritesBase(),
    };
  }, [armor, heartMode, hud, items, live, packId, packs, schemeSlots, showMaxInYellow, view]);
};

export { useSampleState };
