/* @layer renderer-app @kind logic */
import { TALL_PRESET_VALUES } from '@app/settings-controls/display/display.constants';
import type { AppSettings } from '@app/settings.type';
import type { OrientationMode } from './orientation-for-ratio.type';

const orientationForRatio = (settings: AppSettings): OrientationMode => {
  const { aspectRatio, customAspectW, customAspectH } = settings;
  if (aspectRatio === 'auto' || aspectRatio === 'screen') return 'any';
  if (aspectRatio === 'custom') return customAspectW < customAspectH ? 'portrait' : 'landscape';
  return TALL_PRESET_VALUES.has(aspectRatio) ? 'portrait' : 'landscape';
};

export { orientationForRatio };
