/* @layer renderer-app @kind logic */
import type { GameSettings } from '@rotp/features';
import { mainValueOf } from '../AspectRatioControl/behavior/main-value-of';
import { aspectChoices } from './aspect-choices';
import { ASPECT_DESCRIPTIONS } from './display.constants';

const aspectDescription = (settings: GameSettings, fallback: string): string => {
  const { widePresets, tallPresets } = aspectChoices(settings);
  return ASPECT_DESCRIPTIONS[mainValueOf(settings.aspectRatio, { wide: widePresets, tall: tallPresets, preset: undefined })] ?? fallback;
};

export { aspectDescription };
