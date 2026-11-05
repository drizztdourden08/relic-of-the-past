/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import type { ControlsGame } from '@drizztdourden08/brock-input/renderer';
import { controlSchemeOf, experimentalFeaturesEnabled } from '@rotp/features';
import { buildControlsTabs } from './build-controls-tabs';
import { CORE_VERB_DEFS } from './core-verbs.constants';
import { decoratePreset } from './decorate-preset';
import { KEYBOARD_DEFAULTS } from './keyboard-defaults.constants';
import { presetBindings } from './preset-bindings';
import type { UseControlsArgs } from './controls-settings.type';

const useControlsGame = ({ settings, onChange }: UseControlsArgs): ControlsGame => {
  const scheme = controlSchemeOf(settings);
  const experimental = experimentalFeaturesEnabled(settings);
  const { cheatsEnabled, hapticsEnabled } = settings;
  const assignments = settings.modernScheme.assignments;

  return useMemo(() => ({
    tabs: buildControlsTabs({ scheme, experimental, cheatsEnabled, hapticsEnabled, assignments, onChange }),
    verbs: CORE_VERB_DEFS,
    keyboardDefaults: KEYBOARD_DEFAULTS,
    defaultBindings: presetBindings,
    decoratePreset: decoratePreset(scheme),
  }), [scheme, experimental, cheatsEnabled, hapticsEnabled, assignments, onChange]);
};

export { useControlsGame };
