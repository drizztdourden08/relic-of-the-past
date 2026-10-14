/* @layer renderer-hud @kind hook */
import { useHud } from '../../../hooks/useHud';
import { usePauseMenu } from '../../../hooks/usePauseMenu';
import type { PauseVitals } from '../EnhancedPauseView.type';

const usePauseVitals = (scale: number): PauseVitals => {
  const { data, config } = usePauseMenu(scale);
  const { data: hud } = useHud(scale);

  return {
    vitals: {
      healthCurrent: hud.healthCurrent,
      healthCapacity: hud.healthCapacity,
      armor: data.armor,
      magic: hud.magicPower,
      halfMagic: hud.halfMagic,
      heartPieces: data.heartPieces,
      pendants: data.pendants,
      crystals: data.crystals,
    },
    spritesBase: config.spritesBase,
  };
};

export { usePauseVitals };
