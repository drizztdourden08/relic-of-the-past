/* @layer renderer-components @kind logic */
import type { ControlsGame } from '@drizztdourden08/brock-input/renderer';
import { defaultLayoutIdFor } from '@rotp/hud';
import { defaultModernBindings, keyboardModernBindings, renumberSlots } from '@rotp/input-mapping';
import type { ControlSchemeId } from '@rotp/features';
import type { InputProfile } from '@drizztdourden08/brock-input';
import { verbsFromCore } from './verbs-from-core';

type PresetContext = Parameters<NonNullable<ControlsGame['decoratePreset']>>[1];

const modernBindingsFor = (deviceType: string, controls: PresetContext['controls']) => {
  if (deviceType === 'keyboard') return keyboardModernBindings();
  return controls.length > 0 ? defaultModernBindings(controls) : null;
};

const decoratePreset = (scheme: ControlSchemeId): NonNullable<ControlsGame['decoratePreset']> =>
  (profile, { controls }) => {
    if (scheme !== 'modern') return profile;
    const bindings = modernBindingsFor(profile.deviceType, controls);
    if (!bindings) return profile;
    const decorated: InputProfile = {
      ...profile,
      verbs: verbsFromCore(bindings.core),
      slots: renumberSlots(bindings.slots).slots,
      extension: { ...profile.extension, layoutId: defaultLayoutIdFor(profile.deviceType) },
    };
    return decorated;
  };

export { decoratePreset };
