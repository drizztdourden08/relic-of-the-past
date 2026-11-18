/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import { useText } from '@drizztdourden08/brock-react';
import type { ControlsGame } from '@drizztdourden08/brock-input/renderer';
import { controlSchemeOf, experimentalFeaturesEnabled } from '@rotp/features';
import { DISABLED_SETTING_MESSAGES } from '@app/settings-controls/disabled-setting-messages.constants';
import { isMobileHost } from '@app/platform/is-mobile-host';
import { buildControlsTabs } from './build-controls-tabs';
import { CONTROLS_LABELS } from './controls-labels.constants';
import { CORE_VERB_DEFS } from './core-verbs.constants';
import { decoratePreset } from './decorate-preset';
import { KEYBOARD_DEFAULTS } from './keyboard-defaults.constants';
import { presetBindings } from './preset-bindings';
import { TOUCH_EXTRA_DEVICES } from './touch-device.constants';
import { touchListenerExtra } from './touch-listener-extra';
import { touchListenerFullscreen } from './touch-listener-fullscreen';
import type { UseControlsArgs } from './controls-settings.type';

const useControlsGame = ({ settings, onChange }: UseControlsArgs): ControlsGame => {
  const text = useText();
  const cheatsOffMessage = text(DISABLED_SETTING_MESSAGES.cheatsEnabled ?? '');
  const scheme = controlSchemeOf(settings);
  const experimental = experimentalFeaturesEnabled(settings);
  const { cheatsEnabled, hapticsEnabled, touchControls: touch } = settings;
  const mobile = isMobileHost();
  const assignments = settings.modernScheme.assignments;

  return useMemo(() => ({
    tabs: buildControlsTabs({ scheme, experimental, cheatsEnabled, hapticsEnabled, touch, mobile, assignments, onChange, cheatsOffMessage }),
    verbs: CORE_VERB_DEFS,
    labels: CONTROLS_LABELS,
    keyboardDefaults: KEYBOARD_DEFAULTS,
    defaultBindings: presetBindings,
    decoratePreset: decoratePreset(scheme),
    listenerExtra: mobile ? touchListenerExtra : undefined,
    listenerFullscreen: mobile ? touchListenerFullscreen : undefined,
    extraDevices: mobile ? TOUCH_EXTRA_DEVICES : undefined,
  }), [scheme, experimental, cheatsEnabled, hapticsEnabled, touch, mobile, assignments, onChange, cheatsOffMessage]);
};

export { useControlsGame };
