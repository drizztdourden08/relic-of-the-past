/* @layer renderer-app @kind logic */
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { DIALOG_SPEED_STOPS, formatDialogSpeed } from '@rotp/game-data';
import type { DialogSpeedStop } from '@rotp/game-data';
import { TURBO_SPEEDS, formatTurboSpeed, turboSpeedAt, turboSpeedIndex } from '@rotp/game-core';
import { IndexSlider, stopSlider } from '../IndexSlider';
import { DialogHoldControl } from './DialogHoldControl';
import type { ControlContext } from '../settings-controls.type';

const formatTurboIndex = (index: number): string => formatTurboSpeed(turboSpeedAt(index));

const renderGameplayControl = (key: string, ctx: ControlContext): ReactNode | null => {
  const { settings, onChange, disabled } = ctx;
  switch (key) {
    case 'turboSpeed':
      return createElement(IndexSlider, {
        settingKey: key,
        index: turboSpeedIndex(settings.turboSpeed),
        count: TURBO_SPEEDS.length,
        formatIndex: formatTurboIndex,
        onIndex: (index: number) => onChange({ turboSpeed: turboSpeedAt(index) }),
        disabled,
      });
    case 'dialogSpeed':
      return stopSlider({
        settingKey: key,
        stops: DIALOG_SPEED_STOPS,
        value: settings.dialogSpeed,
        format: formatDialogSpeed,
        onStop: (stop) => onChange({ dialogSpeed: stop as DialogSpeedStop }),
        disabled,
      });
    case 'dialogHoldToAccelerate':
      return createElement(DialogHoldControl, {
        enabled: settings.dialogHoldToAccelerate,
        speed: settings.dialogHoldSpeed,
        disabled,
        onChange,
      });
    default:
      return null;
  }
};

export { renderGameplayControl };
