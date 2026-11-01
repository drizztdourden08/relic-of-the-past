/* @layer renderer-app @kind component */
import { AspectRatioControl } from '../AspectRatioControl';
import { aspectChoices } from './aspect-choices';
import { ASPECT_DESCRIPTIONS, ASPECT_LOCKED_MESSAGE } from './display.constants';
import type { ControlContext } from '../settings-controls.type';

const AspectRatioRow = (props: ControlContext) => {
  const { settings, onChange, disabled } = props;
  const { options, widePresets, tallPresets } = aspectChoices(settings);
  return (
    <AspectRatioControl
      label="Aspect Ratio"
      value={settings.aspectRatio}
      options={options}
      widePresets={widePresets}
      tallPresets={tallPresets}
      descriptions={ASPECT_DESCRIPTIONS}
      recommendedValue="auto"
      recommendedNote="Best for most setups."
      customW={settings.customAspectW}
      customH={settings.customAspectH}
      ratioKey="aspectRatio"
      wKey="customAspectW"
      hKey="customAspectH"
      renderIntoNotch={settings.renderIntoNotch}
      lockedMessage={disabled ? ASPECT_LOCKED_MESSAGE : undefined}
      onChange={onChange}
    />
  );
};

export { AspectRatioRow };
