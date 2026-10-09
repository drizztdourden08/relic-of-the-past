/* @layer renderer-components @kind logic */
import type { GameSettings } from '@rotp/features';
import { aspectRatioValue, parseRatioString } from '@app/lib/game/aspect-ratio';
import { ASPECT_OPTIONS } from './hud-controls.constants';

const hudRatioOptions = (settings: GameSettings) => {
  const screenVal = aspectRatioValue(settings.aspectRatio, settings.customAspectW, settings.customAspectH);
  return [
    { value: 'match', label: 'Match' },
    ...ASPECT_OPTIONS.map((opt) =>
      opt.value === 'custom' ? opt : { ...opt, disabled: parseRatioString(opt.value) > screenVal },
    ),
  ];
};

export { hudRatioOptions };
