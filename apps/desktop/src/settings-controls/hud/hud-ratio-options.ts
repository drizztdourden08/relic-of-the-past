/* @layer renderer-components @kind logic */
import type { GameSettings } from '@rotp/features';
import { parseRatioString } from '@drizztdourden08/brock-display/aspect-ratio';
import { allowedRatio } from '@rotp/game-core';
import { msg } from '@drizztdourden08/brock-core/i18n';
import { textOptions } from '../text-options';
import type { TextOf } from '../settings-controls.type';
import { ASPECT_OPTIONS } from './hud-controls.constants';

const hudRatioOptions = (settings: GameSettings, text: TextOf) => {
  const screenVal = allowedRatio(settings);
  return textOptions([
    { value: 'match', label: msg('settings-controls:hud.ratio.match') },
    ...ASPECT_OPTIONS.map((opt) =>
      opt.value === 'custom' ? opt : { ...opt, disabled: parseRatioString(opt.value) > screenVal },
    ),
  ], text);
};

export { hudRatioOptions };
