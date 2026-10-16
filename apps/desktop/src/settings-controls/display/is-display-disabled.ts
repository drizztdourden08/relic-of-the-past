/* @layer renderer-app @kind logic */
import type { GameSettings } from '@rotp/features';
import { rendersWide } from '@rotp/game-core';
import { EXTENDED_ONLY_KEYS } from './display.constants';

const isDisplaySettingDisabled = (key: string, settings: GameSettings): boolean => {
  if (key === 'pixelPerfect') return settings.viewportConstraint !== 'none';
  if (!EXTENDED_ONLY_KEYS.has(key)) return false;
  if (!settings.extendedRendering) return true;
  if (key === 'ultrawideRendering') return !settings.linearWorldTilemap;
  if (key === 'widescreenSprites' || key === 'widescreenPlayArea') return !rendersWide(settings);
  if (key === 'extendY') return settings.aspectRatio !== 'original';
  if (key === 'smoothTransitions') return !settings.cameraLockToViewport;
  return false;
};

export { isDisplaySettingDisabled };
