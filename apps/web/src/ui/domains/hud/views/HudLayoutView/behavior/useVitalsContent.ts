/* @layer renderer-hud @kind hook */
/**
 * Everything the four vitals draw from, gathered once.
 *
 * Three sources meet here and nowhere below: the running game's own counters,
 * the two display preferences that change how a counter READS and not what
 * it says, and the armour tier, which is equipment (not a HUD counter) and
 * tints every heart.
 *
 * `hearts` comes back with them because it is the one value that decides a SIZE
 * and not a picture: the life block grows a row per ten containers, so the
 * layout pass needs it as context and the same division should not be done
 * twice.
 */
import { useMemo } from 'react';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { useHudSettingsStore } from '@app/stores/hud-settings-store';
import { useHud } from '../../../hooks/useHud';
import type { HudVitalsContent } from '../../../compounds/HudNodeRenderer';

/** Health is stored in eighths of a heart. */
const HEALTH_PER_HEART = 8;
/** Bow tier 3 and up is the silver art, exactly as the console reads it. */
const SILVER_ARROW_TIER = 3;

interface VitalsContent {
  vitals: HudVitalsContent;
  /** Heart containers owned right now, used as the layout pass's `hearts` context. */
  hearts: number;
  spritesBase: string;
}

const useVitalsContent = (scale: number): VitalsContent => {
  const { data, config } = useHud(scale);
  const armor = useGameUIStore((s) => s.equipment.armor);
  const { heartMode, showMaxInYellow } = useHudSettingsStore();
  const { spritesBase } = config;

  return useMemo(() => ({
    vitals: {
      healthCurrent: data.healthCurrent,
      healthCapacity: data.healthCapacity,
      heartMode,
      armor,
      magic: data.magicPower,
      halfMagic: data.halfMagic,
      bombs: data.bombs,
      maxBombs: data.maxBombs,
      arrows: data.arrows,
      maxArrows: data.maxArrows,
      keys: data.keys,
      hasSilverArrows: (data.items[0] ?? 0) >= SILVER_ARROW_TIER,
      rupees: data.rupees,
      maxRupees: data.maxRupees,
      showMaxInYellow,
    },
    hearts: Math.floor(data.healthCapacity / HEALTH_PER_HEART),
    spritesBase,
  }), [armor, data, heartMode, showMaxInYellow, spritesBase]);
};

export { useVitalsContent };
export type { VitalsContent };
