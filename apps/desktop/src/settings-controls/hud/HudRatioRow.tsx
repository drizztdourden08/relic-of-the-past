/* @layer renderer-app @kind component */
import { useT, useText } from '@drizztdourden08/brock-react';
import { AspectRatioControl } from '@drizztdourden08/brock-display/renderer';
import { ASPECT_LIMITS } from '@rotp/game-core';
import { ratioPatch } from '../ratio-patch';
import { HUD_RATIO_KEYS } from './hud-controls.constants';
import { hudRatioOptions } from './hud-ratio-options';
import type { ControlContext } from '../settings-controls.type';

const HudRatioRow = (props: ControlContext) => {
  const { settings, onChange } = props;
  const t = useT();
  const text = useText();
  return (
    <AspectRatioControl
      label={t('settings-controls:hud.ratio.label')}
      description={t('settings-controls:hud.ratio.description')}
      value={settings.hudRatio}
      options={hudRatioOptions(settings, text)}
      customW={settings.customHudAspectW}
      customH={settings.customHudAspectH}
      limits={ASPECT_LIMITS}
      onChange={(change) => onChange(ratioPatch(change, HUD_RATIO_KEYS))}
    />
  );
};

export { HudRatioRow };
