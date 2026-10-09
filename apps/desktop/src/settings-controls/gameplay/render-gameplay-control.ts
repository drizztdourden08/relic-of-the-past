/* @layer renderer-app @kind logic */
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { DIALOG_SPEED_STOPS, formatDialogSpeed } from '@shared/game/dialog/pacing';
import type { DialogSpeedStop } from '@shared/game/dialog/pacing';
import { TURBO_SPEEDS, formatTurboSpeed, turboSpeedAt, turboSpeedIndex } from '@shared/display/turbo-speed';
import { IndexSliderRow, stopSliderRow } from '../IndexSliderRow';
import { DialogHoldRow } from './DialogHoldRow';
import type { ControlContext } from '../settings-controls.type';

const formatTurboIndex = (index: number): string => formatTurboSpeed(turboSpeedAt(index));

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
    default:
      return null;
  }
};

export { renderGameplayControl };
