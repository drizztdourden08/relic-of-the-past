/* @layer renderer-components @kind logic */
import type { GameSettings } from '@rotp/features';
import { allowedRatio, parseRatioString } from '@rotp/game-core';
import { ASPECT_OPTIONS } from './hud-controls.constants';

const hudRatioOptions = (settings: GameSettings) => {
  const screenVal = allowedRatio(settings);
  return [
    { value: 'match', label: 'Match' },
    ...ASPECT_OPTIONS.map((opt) =>
      opt.value === 'custom' ? opt : { ...opt, disabled: parseRatioString(opt.value) > screenVal },
    ),
  ];
};

export { hudRatioOptions };
