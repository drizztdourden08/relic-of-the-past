/* @layer renderer-hud @kind hook */
import { useMemo } from 'react';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { useHudSettingsStore } from '@app/stores/hud-settings-store';
import { useHud } from '../../../hooks/useHud';
import { HEALTH_PER_HEART, SILVER_ARROW_TIER } from '../HudLayoutView.constants';
import type { VitalsContent } from '../HudLayoutView.type';

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
