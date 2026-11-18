/* @layer renderer-app @kind component */
import { useT, useText } from '@drizztdourden08/brock-react';
import { AspectRatioControl } from '@drizztdourden08/brock-display/renderer';
import { ASPECT_LIMITS } from '@rotp/game-core';
import { ratioPatch } from '../ratio-patch';
import { aspectChoices } from './aspect-choices';
import { ASPECT_DESCRIPTIONS, ASPECT_KEYS, ASPECT_LOCKED_MESSAGE } from './display.constants';
import type { ControlContext } from '../settings-controls.type';

const AspectRatioRow = (props: ControlContext) => {
  const { settings, onChange, disabled } = props;
  const t = useT();
  const text = useText();
  const { options, widePresets, tallPresets } = aspectChoices(settings, text);
  const descriptions = Object.fromEntries(Object.entries(ASPECT_DESCRIPTIONS).map(([key, value]) => [key, text(value)]));
  return (
    <AspectRatioControl
      label={t('settings-controls:display.aspect.label')}
      value={settings.aspectRatio}
      options={options}
      widePresets={widePresets}
      tallPresets={tallPresets}
      descriptions={descriptions}
      recommendedValue="auto"
      recommendedNote={t('settings-controls:display.aspect.recommended')}
      customW={settings.customAspectW}
      customH={settings.customAspectH}
      limits={ASPECT_LIMITS}
      letterbox={!settings.renderIntoNotch}
      disabled={disabled}
      lockedMessage={text(ASPECT_LOCKED_MESSAGE)}
      onChange={(change) => onChange(ratioPatch(change, ASPECT_KEYS))}
    />
  );
};

export { AspectRatioRow };
