/* @layer renderer-components @kind logic */
import type { ControlsGame } from '@drizztdourden08/brock-input/renderer';
import { defaultLayoutIdFor } from '@rotp/hud';
import { defaultModernBindings, keyboardModernBindings, renumberSlots } from '@rotp/input-mapping';
import type { ControlSchemeId } from '@rotp/features';
import type { ControlsProfile } from './controls-profile.type';
import { verbsFromCore } from './core-verbs-convert';

const decoratePreset = (scheme: ControlSchemeId): NonNullable<ControlsGame['decoratePreset']> =>
  (profile, { controls }) => {
    if (scheme !== 'modern') return profile;
    const deviceType = profile.deviceType;
    const bindings = deviceType === 'keyboard'
      ? keyboardModernBindings()
      : (controls.length > 0 ? defaultModernBindings(controls) : null);
    if (!bindings) return profile;
    const decorated: ControlsProfile = {
      ...profile,
      verbs: verbsFromCore(bindings.core),
      slots: renumberSlots(bindings.slots).slots,
      layoutId: defaultLayoutIdFor(deviceType),
    };
    return decorated;
  };

export { decoratePreset };
