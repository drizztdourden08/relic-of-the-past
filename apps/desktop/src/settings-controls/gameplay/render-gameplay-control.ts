/* @layer renderer-app @kind logic */
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { DIALOG_SPEED_STOPS, formatDialogSpeed } from '@rotp/game-data';
import type { DialogSpeedStop } from '@rotp/game-data';
import { TURBO_SPEEDS, formatTurboSpeed, turboSpeedAt, turboSpeedIndex } from '@rotp/game-core';
import { IndexSliderRow, stopSliderRow } from '../IndexSliderRow';
import { KeyedControlRow } from '../KeyedControlRow';
import { DialogHoldRow } from './DialogHoldRow';
import type { ControlContext } from '../settings-controls.type';

const formatTurboIndex = (index: number): string => formatTurboSpeed(turboSpeedAt(index));

const formatSeconds = (value: number): string => `${value}s`;

const renderGameplayControl = (key: string, ctx: ControlContext): ReactNode | null => {
  const { settings, onChange, disabled } = ctx;
  switch (key) {
    case 'turboSpeed':
      return createElement(IndexSliderRow, {
        settingKey: key,
        index: turboSpeedIndex(settings.turboSpeed),
        count: TURBO_SPEEDS.length,
        formatIndex: formatTurboIndex,
        onIndex: (index: number) => onChange({ turboSpeed: turboSpeedAt(index) }),
        disabled,
      });
    case 'dialogSpeed':
      return stopSliderRow({
        settingKey: key,
        stops: DIALOG_SPEED_STOPS,
        value: settings.dialogSpeed,
        format: formatDialogSpeed,
        onStop: (stop) => onChange({ dialogSpeed: stop as DialogSpeedStop }),
        disabled,
      });
    case 'dialogHoldToAccelerate':
      return createElement(DialogHoldRow, {
        label: 'Hold A to Accelerate',
        description: 'While A is held, dialog plays at the speed on the right',
        enabled: settings.dialogHoldToAccelerate,
        speed: settings.dialogHoldSpeed,
        disabled,
        onChange,
      });
    case 'saveHoldDuration':
      return createElement(KeyedControlRow, {
        settingKey: key,
        input: {
          kind: 'slider', value: settings.saveHoldDuration, min: 1, max: 5, step: 0.5, formatValue: formatSeconds,
          onChange: (saveHoldDuration: number) => onChange({ saveHoldDuration }),
        },
        disabled,
      });
    default:
      return null;
  }
};

export { renderGameplayControl };
