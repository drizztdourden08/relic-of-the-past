/* @layer renderer-app @kind component */
import { DisabledOverlay } from '@drizztdourden08/tessera/composites';
import { AspectRatioControl } from '../AspectRatioControl';
import { aspectChoices } from './aspect-choices';
import { ASPECT_DESCRIPTIONS, ASPECT_LOCKED_MESSAGE } from './display.constants';
import type { ControlContext } from '../settings-controls.type';

const AspectRatioRow = (props: ControlContext) => {
  const { settings, onChange, disabled } = props;
  const { options, widePresets, tallPresets } = aspectChoices(settings);
  return (
    <DisabledOverlay active={disabled} contained message={ASPECT_LOCKED_MESSAGE}>
      <AspectRatioControl
        label="Aspect Ratio"
        description="Screen aspect ratio for the game content."
        value={settings.aspectRatio}
        options={options}
        widePresets={widePresets}
        tallPresets={tallPresets}
        descriptions={ASPECT_DESCRIPTIONS}
        recommendedValue="auto"
        recommendedNote="Best for most setups. Follows your window and adapts to notch or resize."
        customW={settings.customAspectW}
        customH={settings.customAspectH}
        ratioKey="aspectRatio"
        wKey="customAspectW"
        hKey="customAspectH"
        renderIntoNotch={settings.renderIntoNotch}
        onChange={onChange}
      />
    </DisabledOverlay>
  );
};

export { AspectRatioRow };
