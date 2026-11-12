/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import type { ControlsGame } from '@drizztdourden08/brock-input/renderer';
import { controlSchemeOf, experimentalFeaturesEnabled } from '@rotp/features';
import { isMobileHost } from '@app/platform/is-mobile-host';
import { buildControlsTabs } from './build-controls-tabs';
import { CONTROLS_LABELS } from './controls-labels.constants';
import { CORE_VERB_DEFS } from './core-verbs.constants';
import { decoratePreset } from './decorate-preset';
import { KEYBOARD_DEFAULTS } from './keyboard-defaults.constants';
import { presetBindings } from './preset-bindings';
import type { UseControlsArgs } from './controls-settings.type';

const useControlsGame = ({ settings, onChange }: UseControlsArgs): ControlsGame => {
  const scheme = controlSchemeOf(settings);
  const experimental = experimentalFeaturesEnabled(settings);
  const { cheatsEnabled, hapticsEnabled, touchControls: touch } = settings;
  const mobile = isMobileHost();
  const assignments = settings.modernScheme.assignments;

  return useMemo(() => ({
    tabs: buildControlsTabs({ scheme, experimental, cheatsEnabled, hapticsEnabled, touch, mobile, assignments, onChange }),
    verbs: CORE_VERB_DEFS,
    labels: CONTROLS_LABELS,
    keyboardDefaults: KEYBOARD_DEFAULTS,
    defaultBindings: presetBindings,
    decoratePreset: decoratePreset(scheme),
  }), [scheme, experimental, cheatsEnabled, hapticsEnabled, touch, mobile, assignments, onChange]);
};

export { useControlsGame };
