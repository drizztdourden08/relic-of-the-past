/* @layer renderer-app @kind component */
import { AspectRatioControl } from '@drizztdourden08/brock-display/renderer';
import { ASPECT_LIMITS } from '@rotp/game-core';
import { ratioPatch } from '../ratio-patch';
import { aspectChoices } from './aspect-choices';
import { ASPECT_DESCRIPTIONS, ASPECT_KEYS, ASPECT_LOCKED_MESSAGE } from './display.constants';
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
      limits={ASPECT_LIMITS}
      letterbox={!settings.renderIntoNotch}
      disabled={disabled}
      lockedMessage={ASPECT_LOCKED_MESSAGE}
      onChange={(change) => onChange(ratioPatch(change, ASPECT_KEYS))}
    />
  );
};

export { AspectRatioRow };
