/* @layer renderer-app @kind component */
import { AspectRatioControl } from '../AspectRatioControl';
import { hudRatioOptions } from './hud-ratio-options';
import type { ControlContext } from '../settings-controls.type';

const HudRatioInput = (props: ControlContext) => {
  const { settings, onChange } = props;
  return (
    <AspectRatioControl
      label="Aspect Ratio"
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

export { HudRatioInput };
