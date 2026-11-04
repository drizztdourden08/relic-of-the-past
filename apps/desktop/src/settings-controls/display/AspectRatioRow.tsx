/* @layer renderer-app @kind component */
import { AspectRatioControl } from '@drizztdourden08/brock-display/renderer';
import { DisabledOverlay } from '@drizztdourden08/tessera/composites';
import { ASPECT_LIMITS } from '@rotp/game-core';
import { ratioPatch } from '../ratio-patch';
import { aspectChoices } from './aspect-choices';
import { ASPECT_DESCRIPTIONS, ASPECT_KEYS, ASPECT_LOCKED_MESSAGE } from './display.constants';
import type { ControlContext } from '../settings-controls.type';
import './AspectRatioRow.css';

const AspectRatioRow = (props: ControlContext) => {
  const { settings, onChange, disabled } = props;
  const { options, widePresets, tallPresets } = aspectChoices(settings);
  return (
    <DisabledOverlay
      active={disabled}
      contained
      message={disabled ? ASPECT_LOCKED_MESSAGE : undefined}
      className="aspect-ratio-row__lock"
    >
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
        onChange={(change) => onChange(ratioPatch(change, ASPECT_KEYS))}
      />
    </DisabledOverlay>
  );
};

export { AspectRatioRow };
