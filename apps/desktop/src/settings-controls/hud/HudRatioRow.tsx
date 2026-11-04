/* @layer renderer-app @kind component */
import { AspectRatioControl } from '@drizztdourden08/brock-display/renderer';
import { ASPECT_LIMITS } from '@rotp/game-core';
import { ratioPatch } from '../ratio-patch';
import { HUD_RATIO_KEYS } from './hud-controls.constants';
import { hudRatioOptions } from './hud-ratio-options';
import type { ControlContext } from '../settings-controls.type';

const HudRatioRow = (props: ControlContext) => {
  const { settings, onChange } = props;
  return (
    <AspectRatioControl
      label="Aspect Ratio"
      description="Match follows the game view. Fixed ratios pin the HUD to a narrower area."
      value={settings.hudRatio}
      options={hudRatioOptions(settings)}
      customW={settings.customHudAspectW}
      customH={settings.customHudAspectH}
      limits={ASPECT_LIMITS}
      onChange={(change) => onChange(ratioPatch(change, HUD_RATIO_KEYS))}
    />
  );
};

export { HudRatioRow };
