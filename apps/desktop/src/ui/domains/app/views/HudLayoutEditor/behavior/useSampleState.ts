/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import { hudDataScope } from '@shared/hud/data';
import { getSpritesBase } from '@shared/game/logic/queries/item-sprites';
import { buildSlotContent } from '@app/lib/hud/slot-content';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { useHudSettingsStore } from '@app/stores/hud-settings-store';
import { deviceFamilyOf } from '@domains/hud/views/HudLayoutView/behavior/device-family';
import {
  SAMPLE_BOTTLES, SAMPLE_COUNTDOWN, SAMPLE_HUD, SAMPLE_ITEMS, SAMPLE_SLOTS, SAMPLE_SWORD_TIER, sampleSlotAssignments,
} from './sample-state';
import { HEALTH_PER_HEART, SILVER_ARROW_TIER } from './useSampleState.constants';
import type { EditorSampleState, SampleStateArgs } from './useSampleState.type';

const useSampleState = (args: SampleStateArgs): EditorSampleState => {
  const { packId, packs, slots: schemeSlots, view } = args;
  const hud = useGameUIStore((s) => s.hud);
  const items = useGameUIStore((s) => s.inventory.items);
  const armor = useGameUIStore((s) => s.equipment.armor);
  const { heartMode, showMaxInYellow, countdownStyle } = useHudSettingsStore();

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
      content: {
        vitals,
        slots: content.slots,
        glyph: content.glyph,
        countdown: {
          variant: countdownStyle,
          total: SAMPLE_COUNTDOWN.total,
          remaining: SAMPLE_COUNTDOWN.remaining,
          fractionLeft: SAMPLE_COUNTDOWN.fractionLeft,
        },
      },
      filledSlots: content.filledSlots,
      hearts: Math.floor(counters.healthCapacity / HEALTH_PER_HEART),
      dataScope: hudDataScope(vitals, slots.length, {
        active: true, seconds: SAMPLE_COUNTDOWN.remaining, frames: SAMPLE_COUNTDOWN.frames,
      }),
      view,
      spritesBase: getSpritesBase(),
    };
  }, [armor, countdownStyle, heartMode, hud, items, live, packId, packs, schemeSlots, showMaxInYellow, view]);
};

export { useSampleState };
