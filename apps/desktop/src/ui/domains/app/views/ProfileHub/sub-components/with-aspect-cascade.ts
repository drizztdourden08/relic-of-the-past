/* @layer renderer-components @kind logic */
import type { GameSettings } from '@shared/types/settings';
import { REQUIRES_LINEAR, REQUIRES_ULTRAWIDE, TALL_PRESET_VALUES } from './SettingsView.constants';

const withAspectCascade = (patch: Partial<GameSettings>, current: GameSettings): Partial<GameSettings> => {
  const cascade = { ...patch };
  if ('linearWorldTilemap' in patch && !patch.linearWorldTilemap) {
    if (REQUIRES_LINEAR.has(current.aspectRatio) || REQUIRES_ULTRAWIDE.has(current.aspectRatio)) {
      cascade.aspectRatio = '16:9';
    }
    cascade.ultrawideRendering = false;
    cascade.tallRendering = false;
  }
  if ('ultrawideRendering' in patch && !patch.ultrawideRendering) {
    if (REQUIRES_ULTRAWIDE.has(current.aspectRatio)) cascade.aspectRatio = '21:9';
  }
  if ('tallRendering' in patch && !patch.tallRendering) {
    if (TALL_PRESET_VALUES.has(current.aspectRatio)) cascade.aspectRatio = '4:3';
  }
  return cascade;
};

export { withAspectCascade };
