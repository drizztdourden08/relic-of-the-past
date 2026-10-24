/* @layer renderer-app @kind component */
import { AspectRatioControl } from '../AspectRatioControl';
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
      ratioKey="hudRatio"
      wKey="customHudAspectW"
      hKey="customHudAspectH"
      onChange={onChange}
    />
  );
};

export { HudRatioRow };
