/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import { hudDataScope } from '@rotp/hud';
import { getSpritesBase } from '@rotp/game-data';
import { buildSlotContent } from '@app/hud/slot-content';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { useHudSettingsStore } from '@app/stores/hud-settings-store';
import { deviceFamilyOf } from '@app/views/HudLayoutView/behavior/device-family';
import {
  SAMPLE_BOTTLES, SAMPLE_COUNTDOWN, SAMPLE_HUD, SAMPLE_ITEMS, SAMPLE_SLOTS, SAMPLE_SWORD_TIER, sampleSlotAssignments,
  sampleVitals,
} from './sample-state';
import { HEALTH_PER_HEART } from './sample-state.constants';
import type { EditorSampleState, SampleStateArgs } from './sample-state.type';

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

    const vitals = sampleVitals({ counters, live, armor, items, heartMode, showMaxInYellow });

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
