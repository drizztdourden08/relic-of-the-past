/* @layer renderer-components @kind logic */
import type { GameSettings } from '@shared/types/settings';

const drawnBorder = (settings: GameSettings): boolean =>
  settings.dialogBorder === 'single' || settings.dialogBorder === 'double';

const isBorderDisabled = (key: string, settings: GameSettings): boolean => {
  if (key === 'dialogBorderThickness' || key === 'dialogBorderColor') return !drawnBorder(settings);
  if (key === 'dialogCornerMarkAngle') return settings.dialogCornerMark === 'none' || settings.dialogCornerMark === 'circle';
  if (key === 'dialogCornerMark') return !drawnBorder(settings);
  return false;
};

export { isBorderDisabled };
